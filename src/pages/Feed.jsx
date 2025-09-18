import { useMemo, useState } from "react";
import "./Feed.css";

/**
 * Full-CRUD Feed (com correção das regras de Hooks)
 * - Busca com ícones (country/city/date)
 * - CRUD de posts e comentários
 */

export default function Feed({ currentUser = demoUser }) {
  const [filters, setFilters] = useState({ country: "", city: "", date: "" });
  const [posts, setPosts] = useState(seedPosts);

  // ---------- CREATE ----------
  const createPost = (payload) => {
    const newPost = {
      id: crypto.randomUUID(),
      author: { ...currentUser },
      text: payload.text.trim(),
      country: payload.country.trim(),
      city: payload.city.trim(),
      date: payload.date,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    // TODO: POST /api/posts
    setPosts((p) => [newPost, ...p]);
  };

  // ---------- READ (filters) ----------
  const filtered = useMemo(() => {
    const ctry = filters.country.trim().toLowerCase();
    const cty = filters.city.trim().toLowerCase();
    const fdate = filters.date.trim();
    return posts.filter((p) => {
      const okCountry = !ctry || p.country.toLowerCase().includes(ctry);
      const okCity = !cty || p.city.toLowerCase().includes(cty);
      const okDate = !fdate || p.date === fdate;
      return okCountry && okCity && okDate;
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
                  id: crypto.randomUUID(),
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

  return (
    <div className="tm-feed">
      {/* -------- Filters with icons -------- */}
      <div className="tm-filters">
        <InputWithIcon
          icon="search"
          placeholder="Country"
          value={filters.country}
          onChange={(v) => setFilters((f) => ({ ...f, country: v }))}
        />
        <InputWithIcon
          icon="search"
          placeholder="City"
          value={filters.city}
          onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
        />
        <InputWithIcon
          icon="calendar"
          type="date"
          placeholder="dd / mm / aaaa"
          value={filters.date}
          onChange={(v) => setFilters((f) => ({ ...f, date: v }))}
        />
        <button
          className="tm-btn ghost"
          onClick={() => setFilters({ country: "", city: "", date: "" })}
          aria-label="Clear filters"
          title="Clear filters"
        >
          Clear
        </button>
      </div>

      {/* -------- Composer (Create) -------- */}
      <PostComposer onSubmit={createPost} currentUser={currentUser} />

      <div className="tm-results-bar">
        <span>{filtered.length} post(s)</span>
      </div>

      {/* -------- Posts list -------- */}
      <ul className="tm-posts">
        {filtered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLike={() => likePost(post.id)}
            onUpdate={(patch) => updatePost(post.id, patch)}
            onDelete={() => deletePost(post.id)}
            onAddComment={(text) => addComment(post.id, text)}
            onUpdateComment={(cid, text) => updateComment(post.id, cid, text)}
            onDeleteComment={(cid) => deleteComment(post.id, cid)}
          />
        ))}
      </ul>
    </div>
  );
}

/* =================== UI Pieces =================== */

function InputWithIcon({ icon, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="tm-field icon">
      <span className="tm-icon">
        {icon === "calendar" ? CalendarIcon() : SearchIcon()}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="tm-clear"
          onClick={() => onChange("")}
          aria-label="Clear"
        >
          ×
        </button>
      )}
    </div>
  );
}

function PostComposer({ onSubmit, currentUser }) {
  const [text, setText] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  const canPost = text.trim().length > 0;

  const submit = (e) => {
    e.preventDefault();
    if (!canPost) return;
    onSubmit({ text, country, city, date });
    setText("");
    setCountry("");
    setCity("");
    setDate("");
  };

  return (
    <form className="tm-composer" onSubmit={submit}>
      <img
        src={currentUser.photo || defaultAvatar}
        alt="Your profile"
        className="tm-avatar"
      />
      <div className="tm-composer-main">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your plan, invite others, ask for tips..."
          rows={3}
        />
        <div className="tm-composer-meta">
          <InputWithIcon
            icon="search"
            placeholder="Country"
            value={country}
            onChange={setCountry}
          />
          <InputWithIcon
            icon="search"
            placeholder="City"
            value={city}
            onChange={setCity}
          />
          <InputWithIcon
            icon="calendar"
            type="date"
            placeholder="dd / mm / aaaa"
            value={date}
            onChange={setDate}
          />
        </div>
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
  onLike,
  onUpdate,
  onDelete,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
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
        <img
          src={post.author.photo || defaultAvatar}
          alt={post.author.name}
          className="tm-avatar"
        />
        <div className="tm-author">
          <strong>{post.author.name}</strong>
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

      <div className="tm-meta">
        {post.country && <span className="tm-chip">🌍 {post.country}</span>}
        {post.city && <span className="tm-chip">📍 {post.city}</span>}
        {post.date && <span className="tm-chip">🗓 {post.date}</span>}
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
      />
    </li>
  );
}

/** ---------- Comentários (sem hooks dentro do map!) ---------- */
function Comments({ comments, currentUser, onAdd, onUpdate, onDelete }) {
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
          currentUser={currentUser}
          onUpdate={(newText) => onUpdate(c.id, newText)}
          onDelete={() => onDelete(c.id)}
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

/** Cada comentário agora é um componente próprio (hooks no topo) */
function CommentItem({ comment, currentUser, onUpdate, onDelete }) {
  const mine = comment.author.id === currentUser.id;
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
      <img
        src={comment.author.photo || defaultAvatar}
        alt={comment.author.name}
        className="tm-avatar sm"
      />
      <div className="tm-comment-body">
        <div className="tm-comment-row">
          <strong>{comment.author.name}</strong>
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

/* =================== Ícones (inline) =================== */
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

/* =================== Demo data =================== */
const defaultAvatar =
  "https://raw.githubusercontent.com/feathericons/feather/master/icons/user.svg";

const demoUser = {
  id: "u1",
  name: "You",
  photo: "",
};

const seedPosts = [
  {
    id: "p1",
    author: { id: "u2", name: "Joice Conte", photo: "" },
    text: "Hey, I would like to try this restaurant called La Tosqueta de Blay in Barcelona. Anyone?",
    country: "Spain",
    city: "Barcelona",
    date: "2025-09-28",
    likes: 4,
    comments: [],
    createdAt: "2025-09-18T12:00:00.000Z",
    updatedAt: null,
  },
];
