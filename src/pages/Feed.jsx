import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Feed.css";
import likeIcon from "../assets/Iconos/Like.png";
import comentIcon from "../assets/Iconos/Comment.png";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

function getUID(u) {
  return (u && (u._id || u.id)) || null;
}

function authHeaders() {
  const token = localStorage.getItem("authToken");
  localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
const defaultAvatar =
  "https://raw.githubusercontent.com/feathericons/feather/master/icons/user.svg";
const demoUser = { id: "507f1f77bcf86cd799439011", name: "You", photo: "" };
const CSC_API_URL = "https://api.countrystatecity.in/v1";
const CSC_API_KEY = "eDZSRUZZSlhUMGpkNm1GUXVwUXN5REIxSGF3YldESllpaXhuWUM4RA==";
const HEADERS = { "X-CSCAPI-KEY": CSC_API_KEY };
function getBestDate(obj) {
  const val = obj?.createdAt || obj?.updatedAt || obj?.date || obj?.timestamp;
  return val ? new Date(val) : null;
}

export default function Feed({ currentUser = demoUser }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    country: "",
    city: "",
    startDate: "",
    endDate: "",
  });
  const [posts, setPosts] = useState([]);
  const [countries, setCountries] = useState([]);

  // -------------------- FETCH INICIAL --------------------
  useEffect(() => {
    fetch("http://localhost:5005/api/posts")
      .then((res) => res.json())
      .then((data) => {
        const safePosts = data.map((p) => ({
          ...p,
          comments: p.comments || [],
          likes: p.likes || [],
        }));
        setPosts(safePosts);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${CSC_API_URL}/countries`, { headers: HEADERS })
      .then((res) => res.json())
      .then((data) => setCountries(data))
      .catch(console.error);
  }, []);

  // aplica o fundo da rota e padding fluido do container
  useEffect(() => {
    document.body.classList.add("feed-route");
    return () => document.body.classList.remove("feed-route");
  }, []);

  // ----------------- CRUD Posts -----------------
  const createPost = async (text) => {
    if (!currentUser?.id) {
      console.error("No user logged in");
      return;
    }

    const newPost = {
      title: text.trim().slice(0, 50) || "Untitled", // opcional: limitar largo
      comment: text.trim(),
      author: currentUser.id, // ⚡ siempre mandamos un ID válido
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:5005/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const saved = await res.json();

      // Aseguramos que likes y comments existan
      saved.likes = saved.likes || [];
      saved.comments = saved.comments || [];

      // Añadimos el nuevo post al estado
      setPosts((prev) => [saved, ...prev]);
    } catch (err) {
      console.error("❌ ERROR createPost:", err);
    }
  };

  const updatePost = async (id, patch) => {
    try {
      const res = await fetch(`http://localhost:5005/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const updated = await res.json();
      setPosts((list) =>
        list.map((p) =>
          p._id === id
            ? {
                ...p, // mantenemos autor, comments, createdAt
                ...updated,
                comments: p.comments || [],
                likes: updated.likes || p.likes || [],
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deletePost = async (id) => {
    try {
      await fetch(`http://localhost:5005/api/posts/${id}`, {
        method: "DELETE",
      });
      setPosts((list) => list.filter((p) => p.id !== id && p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------- Likes -----------------
  const likePost = async (id) => {
    try {
      const res = await fetch(`http://localhost:5005/api/posts/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }), // ⚡ enviamos el ID del usuario actual
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();

      // Asegurarnos de que likes y comments existan
      updated.likes = updated.likes || [];
      updated.comments = updated.comments || [];

      // Actualizamos la lista de posts
      setPosts((list) => list.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error("❌ ERROR likePost:", err);
    }
  };

  // ----------------- CRUD Comentários (somente datas) -----------------
  const addComment = async (postId, text) => {
    const clean = text?.trim();
    if (!clean) return;

    const uid = getUID(currentUser);
    if (!uid) {
      console.error("No user id (need _id or id)");
      return;
    }

    // não enviamos "user" no body; o backend pega do JWT
    const newComment = {
      text: clean,
      user: uid, // <<<<<<<<<<<<<< AQUI
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(
        `http://localhost:5005/api/posts/${postId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() }, // << envia Bearer token
          body: JSON.stringify(newComment),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const saved = await res.json();

      // garante que haja createdAt (caso a API não devolva)
      setPosts((list) =>
        list.map((p) =>
          (p._id || p.id) === postId
            ? {
                ...p,
                comments: [
                  ...(p.comments || []),
                  {
                    ...saved,
                    createdAt: saved.createdAt || new Date().toISOString(),
                  },
                ],
              }
            : p
        )
      );
    } catch (err) {
      console.error("❌ ERROR addComment:", err);
    }
  };

  // ✅ ADIÇÃO: updateComment que preserva createdAt (para a data não sumir ao editar)
  const updateComment = async (postId, commentId, newText) => {
    const clean = newText?.trim();
    if (!clean) return;

    try {
      const res = await fetch(
        `http://localhost:5005/api/posts/${postId}/comments/${commentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clean }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      setPosts((list) =>
        list.map((p) =>
          (p._id || p.id) === postId
            ? {
                ...p,
                comments: (p.comments || []).map((c) =>
                  c._id === commentId
                    ? {
                        ...c,
                        ...updated,
                        // não perder a data original
                        createdAt: c.createdAt || updated.createdAt,
                      }
                    : c
                ),
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      await fetch(
        `http://localhost:5005/api/posts/${postId}/comments/${commentId}`,
        { method: "DELETE" }
      );
      setPosts((list) =>
        list.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: (p.comments || []).filter((c) => c._id !== commentId),
              }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const goProfile = (userId) => navigate(`/users/${userId}`);

  // ----------------- FILTRADO -----------------
  const filtered = posts.filter((p) => {
    const ctry = filters.country.toLowerCase();
    const cty = filters.city.toLowerCase();
    const start = filters.startDate ? new Date(filters.startDate) : null;
    const end = filters.endDate ? new Date(filters.endDate) : null;
    const okCountry =
      !ctry || (p.snapshot?.country || "").toLowerCase().includes(ctry);
    const okCity = !cty || (p.snapshot?.city || "").toLowerCase().includes(cty);
    let dateOk = true;
    if (start || end) {
      const d = new Date(p.createdAt);
      if (start && d < start) dateOk = false;
      if (end && d > end) dateOk = false;
    }
    return okCountry && okCity && dateOk;
  });

  // ----------------- DEBOUNCE -----------------
  const debounceRef = useRef({});
  const debounce = (key, fn, delay = 300) => {
    clearTimeout(debounceRef.current[key]);
    debounceRef.current[key] = setTimeout(fn, delay);
  };

  const fetchCountriesDebounced = useCallback(
    (query, cb) => {
      debounce(
        "countries",
        () => {
          const list = countries
            .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
            .map((c) => c.name)
            .slice(0, 8);
          cb(list);
        },
        300
      );
    },
    [countries]
  );

  const fetchCitiesDebounced = useCallback(
    (query, countryName, cb) => {
      if (!query || !countryName) return cb([]);
      const country = countries.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase()
      );
      if (!country) return cb([]);
      debounce(
        "cities",
        async () => {
          try {
            const res = await fetch(
              `${CSC_API_URL}/countries/${country.iso2}/cities?limit=20&namePrefix=${query}`,
              { headers: HEADERS }
            );
            const data = await res.json();
            cb(data.map((c) => c.name));
          } catch (e) {
            console.error(e);
            cb([]);
          }
        },
        300
      );
    },
    [countries]
  );

  // ================== RENDER ==================
  return (
    <div className="tm-feed fullbleed">
      <div className="tm-filters">
        <Autocomplete
          icon="search"
          placeholder="Country"
          value={filters.country}
          onChange={(v) => setFilters((f) => ({ ...f, country: v, city: "" }))}
          fetchOptions={fetchCountriesDebounced}
          onClear={() =>
            setFilters({ country: "", city: "", startDate: "", endDate: "" })
          }
          onSearch={() => console.log("SEARCH with:", filters)}
        />
        <Autocomplete
          icon="search"
          placeholder="City"
          value={filters.city}
          onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
          fetchOptions={(q, cb) => fetchCitiesDebounced(q, filters.country, cb)}
          onClear={() =>
            setFilters({ country: "", city: "", startDate: "", endDate: "" })
          }
          onSearch={() => console.log("SEARCH with:", filters)}
        />
      </div>

      <PostComposer onSubmit={createPost} currentUser={currentUser} />

      <ul className="tm-posts">
        {filtered.map((post) => (
          <PostCard
            key={post._id || post.id}
            post={post}
            currentUser={currentUser}
            onAvatarClick={() => goProfile(post.author)}
            onLike={() => likePost(post._id || post.id)}
            onUpdate={(patch) => updatePost(post._id || post.id, patch)}
            onDelete={() => deletePost(post._id || post.id)}
            onAddComment={(text) => addComment(post._id || post.id, text)}
            onUpdateComment={(cid, text) =>
              updateComment(post._id || post.id, cid, text)
            }
            onDeleteComment={(cid) => deleteComment(post._id || post.id, cid)}
            onCommentAvatarClick={(uid) => goProfile(uid)}
          />
        ))}
      </ul>
    </div>
  );
}

// =================== COMPONENTES AUXILIARES ===================
function Autocomplete({
  icon,
  value,
  onChange,
  placeholder,
  fetchOptions,
  onClear,
  onSearch,
}) {
  const [options, setOptions] = useState([]);
  const handleInput = (v) => {
    onChange(v);
    if (!v || v.length < 2) return setOptions([]);
    fetchOptions(v, setOptions);
  };

  return (
    <div className="tm-field icon">
      <span className="tm-icon">{icon === "calendar" ? "📅" : "🔍"}</span>
      <input
        list={placeholder}
        value={value}
        placeholder={placeholder}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch?.();
        }}
      />
      <datalist id={placeholder}>
        {options.map((opt, index) => (
          <option key={`${opt}-${index}`} value={opt} />
        ))}
      </datalist>
      {value && (
        <button
          className="tm-clear"
          onClick={() => {
            handleInput("");
            onClear?.();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

function PostComposer({ onSubmit, currentUser }) {
  const [text, setText] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };
  return (
    <form className="tm-composer" onSubmit={submit}>
      <img
        src={currentUser.photo || defaultAvatar}
        alt="You"
        className="tm-avatar"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share something..."
      />
      <button type="submit" disabled={!text.trim()}>
        Post
      </button>
    </form>
  );
}

/* ==================== SMALL INTERNAL COMPONENTS ==================== */

// Minimal Composer with a single textarea and submit
function Composer({ onSubmit }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
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
    <form onSubmit={send} style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <input
        type="text"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
        placeholder="Write a comment…"
        className="input-pill"
        style={{ flex: 1 }}
      />
      <button type="submit" className="pill">
        <img src={comentIcon} alt="coment" className="icon-like" />
      </button>
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
  const author = post.author
    ? typeof post.author === "object"
      ? post.author
      : { id: post.author, name: "User", photo: defaultAvatar }
    : {
        id: demoUser.id,
        name: demoUser.name,
        photo: demoUser.photo || defaultAvatar,
      };

  const isOwner = currentUser.id === author.id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.comment || post.text || "");

  const saveEdit = () => {
    const t = draft.trim();
    if (!t) return;
    onUpdate({ comment: t });
    setEditing(false);
  };

  return (
    <li className="tm-post">
      <div className="tm-post-head">
        <button onClick={onAvatarClick}>
          <img
            src={author.photo || defaultAvatar}
            alt={author.name}
            className="tm-avatar"
          />
        </button>
        <div>
          <strong>{author.name}</strong>
          <span>
            {post.createdAt
              ? new Date(post.createdAt).toLocaleString()
              : "Unknown date"}
          </span>
        </div>
        {isOwner && !editing && (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </>
        )}
        {isOwner && editing && (
          <>
            <button onClick={saveEdit}>Save</button>
            <button
              onClick={() => {
                setEditing(false);
                setDraft(post.comment || post.text || "");
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Mostrar título y comentario */}
      {!editing ? (
        <>
          <h3>{post.title || "Untitled"}</h3>
          <p>{post.comment || post.text}</p>
        </>
      ) : (
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />
      )}

      <div className="tm-post-actions">
        <button onClick={onLike} className="like-button">
          <img src={likeIcon} alt="like" className="like-icon" />
          {post.likes?.length || 0}
        </button>
        <span>💬 {post.comments?.length || 0}</span>
      </div>

      <Comments
        comments={post.comments || []}
        currentUser={currentUser}
        onAdd={onAddComment}
        onUpdate={onUpdateComment}
        onDelete={onDeleteComment}
        onAvatarClick={onCommentAvatarClick}
      />
    </li>
  );
}

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
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };
  return (
    <div className="tm-comments">
      {comments.map(
        (
          c //added by joice to render date on the comments
        ) => (
          <CommentItem
            key={c._id}
            comment={c}
            mine={(c.user || c.author) === currentUser.id} // << usa user
            onUpdate={(txt) => onUpdate(c._id, txt)}
            onDelete={() => onDelete(c._id)}
            onAvatarClick={() => onAvatarClick(c.user || c.author)} // << usa user
          />
        )
      )}
      <form className="tm-comment-form" onSubmit={submit}>
        <img
          src={currentUser.photo || defaultAvatar}
          alt="You"
          className="tm-avatar sm"
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button disabled={!text.trim()}>Send</button>
      </form>
    </div>
  );
}
// edited by Joice on 28/09 to add date to the comments on feed
function CommentItem({ comment, mine, onUpdate, onDelete, onAvatarClick }) {
  const authorId = comment.user || comment.author;
  const author = { id: authorId, name: "User", photo: defaultAvatar };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text || "");

  const when = getBestDate(comment);
  const whenLabel = when ? when.toLocaleString("pt-PT") : "Unknown date";

  const save = () => {
    const t = draft.trim();
    if (!t) return;
    onUpdate(t);
    setEditing(false);
  };

  return (
    <div className="tm-comment">
      <button onClick={onAvatarClick}>
        <img
          src={author.photo || defaultAvatar}
          alt={author.name}
          className="tm-avatar sm"
        />
      </button>
      <div>
        <div className="tm-comment-meta">
          <strong>{author.name}</strong>
          <time
            dateTime={when ? when.toISOString() : undefined}
            className="tm-comment-time"
          >
            {whenLabel}
          </time>
        </div>

        {!editing && <p>{comment.text}</p>}
        {editing && (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />
        )}

        {mine && !editing && (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </>
        )}
        {mine && editing && (
          <>
            <button onClick={save}>Save</button>
            <button
              onClick={() => {
                setEditing(false);
                setDraft(comment.text || "");
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ==================== RANGE PICKER (in-file component) ==================== */
/** Button that opens a popover calendar (react-date-range) to pick start/end. */
function RangePicker({ value, onChange, label = "Start date — End date" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (open && ref.current && !ref.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const start = value.startDate ? new Date(value.startDate) : new Date();
  const end = value.endDate ? new Date(value.endDate) : new Date();

  return (
    <div className="tm-comment">
      <button
        type="button"
        className="date-range"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7 2v4M17 2v4M3 10h18M5 6h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {value.startDate && value.endDate
          ? `${value.startDate} → ${value.endDate}`
          : label}
      </button>

      {open && (
        <div className="date-popover">
          <DateRange
            ranges={[{ startDate: start, endDate: end, key: "selection" }]}
            onChange={({ selection }) => {
              const toISO = (d) => d.toISOString().slice(0, 10);
              onChange({
                startDate: toISO(selection.startDate),
                endDate: toISO(selection.endDate),
              });
            }}
            months={1}
            direction="horizontal"
            moveRangeOnFirstSelection={false}
            rangeColors={["#1C3739"]}
          />
        </div>
      )}
    </div>
  );
}
