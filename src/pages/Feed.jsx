import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Feed.css";

/**
 * Feed (search-first)
 * - Filtros: Country/City (autocomplete), Date range (um único campo)
 * - Composer: apenas texto
 * - CRUD local de posts/comentários (troque TODOs por chamadas à API depois)
 * - Avatar clicável leva a /users/:id
 */

export default function Feed({ currentUser = demoUser }) {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    country: "",
    city: "",
    startDate: "",
    endDate: "",
  });

  const [posts, setPosts] = useState(seedPosts);

  // aplica o fundo da rota e padding fluido do container
  useEffect(() => {
    document.body.classList.add("feed-route");
    return () => document.body.classList.remove("feed-route");
  }, []);

  // ---------- CREATE ----------
  const createPost = (text) => {
    const newPost = {
      id: uid(),
      author: { ...currentUser },
      text: text.trim(),
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    // TODO: POST /api/posts
    setPosts((p) => [newPost, ...p]);
  };

  // ---------- READ + FILTER ----------
  const filtered = useMemo(() => {
    const ctry = filters.country.trim().toLowerCase();
    const cty = filters.city.trim().toLowerCase();
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;

    return posts.filter((p) => {
      const okCountry = !ctry || (p.country || "").toLowerCase().includes(ctry);
      const okCity = !cty || (p.city || "").toLowerCase().includes(cty);

      if (!start && !end) return okCountry && okCity;

      const inRange = (iso) => {
        const d = new Date(iso);
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      };

      // usa createdAt para filtro por período
      const dateOk = p.createdAt ? inRange(p.createdAt) : true;

      return okCountry && okCity && dateOk;
    });
  }, [filters, posts]);

  // ---------- UPDATE ----------
  const updatePost = (id, patch) => {
    // TODO: PATCH /api/posts/:id
    setPosts((list) =>
      list.map((p) =>
        p.id === id
          ? { ...p, ...patch, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  // ---------- DELETE ----------
  const deletePost = (id) => {
    // TODO: DELETE /api/posts/:id
    setPosts((list) => list.filter((p) => p.id !== id));
  };

  // ---------- LIKE ----------
  const likePost = (id) => {
    // TODO: POST /api/posts/:id/like
    setPosts((list) =>
      list.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  // ---------- COMMENTS CRUD ----------
  const addComment = (postId, text) => {
    // TODO: POST /api/posts/:postId/comments
    setPosts((list) =>
      list.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: uid(),
                  author: { ...currentUser },
                  text: text.trim(),
                  createdAt: new Date().toISOString(),
                  updatedAt: null,
                },
              ],
            }
          : p
      )
    );
  };

  const updateComment = (postId, commentId, newText) => {
    // TODO: PATCH /api/posts/:postId/comments/:commentId
    setPosts((list) =>
      list.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      text: newText.trim(),
                      updatedAt: new Date().toISOString(),
                    }
                  : c
              ),
            }
          : p
      )
    );
  };

  const deleteComment = (postId, commentId) => {
    // TODO: DELETE /api/posts/:postId/comments/:commentId
    setPosts((list) =>
      list.map((p) =>
        p.id === postId
          ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
          : p
      )
    );
  };

  const goProfile = (userId) => navigate(`/users/${userId}`);

  return (
    <div className="tm-feed fullbleed">
      {/* -------- Filtros -------- */}
      <div className="tm-filters">
        <Autocomplete
          icon="search"
          placeholder="Country"
          value={filters.country}
          onChange={(v) => setFilters((f) => ({ ...f, country: v, city: "" }))}
          fetchOptions={fetchCountrySuggestions}
        />
        <Autocomplete
          icon="search"
          placeholder="City"
          value={filters.city}
          onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
          fetchOptions={(q) => fetchCitySuggestions(q, filters.country)}
        />
        <DateRangeField
          start={filters.startDate}
          end={filters.endDate}
          onStart={(v) => setFilters((f) => ({ ...f, startDate: v }))}
          onEnd={(v) => setFilters((f) => ({ ...f, endDate: v }))}
        />
        <button
          className="tm-btn ghost"
          onClick={() =>
            setFilters({ country: "", city: "", startDate: "", endDate: "" })
          }
          aria-label="Clear filters"
          title="Clear filters"
        >
          Clear
        </button>
      </div>

      {/* -------- Composer -------- */}
      <PostComposer onSubmit={createPost} currentUser={currentUser} />

      <div className="tm-results-bar">
        <span>{filtered.length} post(s)</span>
      </div>

      {/* -------- Lista de posts -------- */}
      <ul className="tm-posts">
        {filtered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onAvatarClick={() => goProfile(post.author.id)}
            onLike={() => likePost(post.id)}
            onUpdate={(patch) => updatePost(post.id, patch)}
            onDelete={() => deletePost(post.id)}
            onAddComment={(text) => addComment(post.id, text)}
            onUpdateComment={(cid, text) => updateComment(post.id, cid, text)}
            onDeleteComment={(cid) => deleteComment(post.id, cid)}
            onCommentAvatarClick={(uid) => goProfile(uid)}
          />
        ))}
      </ul>
    </div>
  );
}

/* =================== Subcomponentes =================== */

function Autocomplete({ icon, value, onChange, placeholder, fetchOptions }) {
  const [options, setOptions] = useState([]);

  const handleInput = async (v) => {
    onChange(v);
    if (v.trim().length < 2) return setOptions([]);
    try {
      const list = await fetchOptions(v.trim());
      setOptions(list.slice(0, 8));
    } catch {
      setOptions([]);
    }
  };

  return (
    <div className="tm-field icon">
      <span className="tm-icon">
        {icon === "calendar" ? <CalendarIcon /> : <SearchIcon />}
      </span>
      <input
        list={placeholder}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleInput(e.target.value)}
      />
      <datalist id={placeholder}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
      {value && (
        <button
          className="tm-clear"
          onClick={() => handleInput("")}
          aria-label="Clear"
        >
          ×
        </button>
      )}
    </div>
  );
}

/** Campo único que abre popover com início/fim */
function DateRangeField({ start, end, onStart, onEnd }) {
  const [open, setOpen] = useState(false);
  const pop = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!pop.current) return;
      if (!pop.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const label =
    (start ? formatDate(start) : "dd/mm/aaaa") +
    " — " +
    (end ? formatDate(end) : "dd/mm/aaaa");

  return (
    <div className="tm-field icon">
      <span className="tm-icon">
        <CalendarIcon />
      </span>
      <button
        type="button"
        className="tm-range-display"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Select date range"
      >
        {label}
      </button>

      {open && (
        <div
          className="tm-range-popover"
          ref={pop}
          role="dialog"
          aria-label="Select dates"
        >
          <div className="tm-range-grid">
            <div>
              <label className="tm-range-label">Start</label>
              <input
                type="date"
                value={start}
                onChange={(e) => onStart(e.target.value)}
              />
            </div>
            <div>
              <label className="tm-range-label">End</label>
              <input
                type="date"
                value={end}
                onChange={(e) => onEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="tm-range-actions">
            <button
              className="tm-btn ghost"
              onClick={() => {
                onStart("");
                onEnd("");
              }}
            >
              Clear
            </button>
            <button className="tm-btn primary" onClick={() => setOpen(false)}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostComposer({ onSubmit, currentUser }) {
  const [text, setText] = useState("");
  const canPost = text.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!canPost) return;
    onSubmit(text);
    setText("");
  };

  return (
    <form className="tm-composer" onSubmit={submit}>
      <button type="button" className="tm-avatar-btn" title="Your profile">
        <img
          src={currentUser.photo || defaultAvatar}
          alt="Your profile"
          className="tm-avatar"
        />
      </button>
      <div className="tm-composer-main">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your plan, invite others, ask for tips..."
          rows={3}
        />
      </div>
      <div className="tm-composer-actions">
        <button type="submit" className="tm-btn" disabled={!canPost}>
          Post
        </button>
      </div>
    </form>
  );
}

function PostCard({
  post,
  currentUser,
  onAvatarClick,
  onLike,
  onUpdate,
  onDelete,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onCommentAvatarClick,
}) {
  const isOwner = currentUser?.id === post.author.id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onUpdate({ text: trimmed });
    setEditing(false);
  };

  return (
    <li className="tm-post">
      <div className="tm-post-head">
        <button
          className="tm-avatar-btn"
          onClick={onAvatarClick}
          title="Open profile"
        >
          <img
            src={post.author.photo || defaultAvatar}
            alt={post.author.name}
            className="tm-avatar"
          />
        </button>
        <div className="tm-author">
          <button
            className="tm-author-link"
            onClick={onAvatarClick}
            title="Open profile"
          >
            <strong>{post.author.name}</strong>
          </button>
          <span className="tm-time">
            {new Date(post.createdAt).toLocaleString()}
            {post.updatedAt ? " · edited" : ""}
          </span>
        </div>
        <div className="tm-post-ops">
          {isOwner && !editing && (
            <>
              <button
                className="tm-link"
                onClick={() => setEditing(true)}
                title="Edit post"
              >
                Edit
              </button>
              <button
                className="tm-link danger"
                onClick={() =>
                  window.confirm("Delete this post?") && onDelete()
                }
                title="Delete post"
              >
                Delete
              </button>
            </>
          )}
          {editing && (
            <>
              <button className="tm-link" onClick={saveEdit} title="Save">
                Save
              </button>
              <button
                className="tm-link"
                onClick={() => {
                  setEditing(false);
                  setDraft(post.text);
                }}
                title="Cancel"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {!editing ? (
        <p className="tm-post-text">{post.text}</p>
      ) : (
        <textarea
          className="tm-edit-area"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
        />
      )}

      <div className="tm-post-actions">
        <button
          className="tm-action"
          onClick={onLike}
          aria-label="Like post"
          title="Like"
        >
          ♥ {post.likes}
        </button>
        <span className="tm-divider" />
        <span className="tm-action" title="Comments">
          💬 {post.comments.length}
        </span>
      </div>

      <Comments
        comments={post.comments}
        currentUser={currentUser}
        onAdd={onAddComment}
        onUpdate={onUpdateComment}
        onDelete={onDeleteComment}
        onAvatarClick={onCommentAvatarClick}
      />
    </li>
  );
}

/** Comentários (cada item é um componente — hooks no topo) */
function Comments({
  comments,
  currentUser,
  onAdd,
  onUpdate,
  onDelete,
  onAvatarClick,
}) {
  const [text, setText] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  };

  return (
    <div className="tm-comments">
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          mine={c.author.id === currentUser.id}
          onUpdate={(newText) => onUpdate(c.id, newText)}
          onDelete={() => onDelete(c.id)}
          onAvatarClick={() => onAvatarClick(c.author.id)}
        />
      ))}

      <form className="tm-comment-form" onSubmit={submit}>
        <img
          src={currentUser.photo || defaultAvatar}
          alt="Your profile"
          className="tm-avatar sm"
        />
        <input
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="tm-btn sm" disabled={!text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

function CommentItem({ comment, mine, onUpdate, onDelete, onAvatarClick }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onUpdate(trimmed);
    setEditing(false);
  };

  return (
    <div className="tm-comment">
      <button
        className="tm-avatar-btn sm"
        onClick={onAvatarClick}
        title="Open profile"
      >
        <img
          src={comment.author.photo || defaultAvatar}
          alt={comment.author.name}
          className="tm-avatar sm"
        />
      </button>
      <div className="tm-comment-body">
        <div className="tm-comment-row">
          <button
            className="tm-author-link"
            onClick={onAvatarClick}
            title="Open profile"
          >
            <strong>{comment.author.name}</strong>
          </button>
          {mine && !editing && (
            <div className="tm-comment-ops">
              <button
                className="tm-link"
                onClick={() => setEditing(true)}
                title="Edit comment"
              >
                Edit
              </button>
              <button
                className="tm-link danger"
                onClick={() =>
                  window.confirm("Delete this comment?") && onDelete()
                }
                title="Delete comment"
              >
                Delete
              </button>
            </div>
          )}
          {mine && editing && (
            <div className="tm-comment-ops">
              <button className="tm-link" onClick={save} title="Save">
                Save
              </button>
              <button
                className="tm-link"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.text);
                }}
                title="Cancel"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!editing ? (
          <p>
            {comment.text}{" "}
            <span className="tm-time small">
              {new Date(comment.createdAt).toLocaleString()}
              {comment.updatedAt ? " · edited" : ""}
            </span>
          </p>
        ) : (
          <textarea
            className="tm-edit-area"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}

/* =================== Utils e Ícones =================== */

function uid() {
  // id simples para demo
  return `id_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function formatDate(isoOrYYYYMMDD) {
  const d = new Date(isoOrYYYYMMDD);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 21l-4.35-4.35m2.02-5.15a7.17 7.17 0 11-14.34 0 7.17 7.17 0 0114.34 0z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 10h18M8 2v4M16 2v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* =================== Stubs de autocomplete (troque pela API) =================== */

async function fetchCountrySuggestions(q) {
  const pool = [
    "Spain",
    "Portugal",
    "France",
    "Italy",
    "Germany",
    "Netherlands",
  ];
  return pool.filter((x) => x.toLowerCase().includes(q.toLowerCase()));
}
async function fetchCitySuggestions(q, country) {
  const byCountry = {
    spain: ["Barcelona", "Madrid", "Valencia", "Seville"],
    portugal: ["Lisbon", "Porto", "Braga"],
    france: ["Paris", "Lyon", "Marseille"],
    italy: ["Rome", "Milan", "Florence"],
    germany: ["Berlin", "Munich", "Hamburg"],
    netherlands: ["Amsterdam", "Rotterdam", "Utrecht"],
  };
  const key = (country || "").toLowerCase();
  const pool = byCountry[key] || Object.values(byCountry).flat();
  return pool.filter((x) => x.toLowerCase().includes(q.toLowerCase()));
}

/* =================== Demo data =================== */

const defaultAvatar =
  "https://raw.githubusercontent.com/feathericons/feather/master/icons/user.svg";

const demoUser = { id: "u1", name: "You", photo: "" };

const seedPosts = [
  {
    id: "p1",
    author: { id: "u2", name: "Joice Conte", photo: "" },
    text: "Hey, I would like to try this restaurant called La Tosqueta de Blay in Barcelona. Anyone?",
    likes: 4,
    comments: [],
    createdAt: "2025-09-18T12:00:00.000Z",
    updatedAt: null,
  },
];
