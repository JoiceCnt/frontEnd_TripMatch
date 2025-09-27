<<<<<<< HEAD
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Feed.css";

const defaultAvatar = "https://raw.githubusercontent.com/feathericons/feather/master/icons/user.svg";
const demoUser = { id: "507f1f77bcf86cd799439011", name: "You", photo: "" };
const CSC_API_URL = "https://api.countrystatecity.in/v1";
const CSC_API_KEY = "eDZSRUZZSlhUMGpkNm1GUXVwUXN5REIxSGF3YldESllpaXhuWUM4RA==";
const HEADERS = { "X-CSCAPI-KEY": CSC_API_KEY };
=======
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Feed.css";

import likeIcon from "../assets/Iconos/Like.png";
import comentIcon from "../assets/Iconos/Comment.png";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/**
 * Feed (search-first)
 * - Toolbar: Country / City / Date Range + actions
 * - Composer: simple text-only post creator (local state for now)
 * - Local CRUD: create/like/comment stubs (replace with API later)
 */
>>>>>>> 57f622a5c19a9ad39fe72d8b5aa7a6e0e067d641

export default function Feed({ currentUser = demoUser }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ country: "", city: "", startDate: "", endDate: "" });
  const [posts, setPosts] = useState([]);
  const [countries, setCountries] = useState([]);

<<<<<<< HEAD
  // -------------------- FETCH INICIAL --------------------
  useEffect(() => {
    fetch("http://localhost:5005/api/posts")
      .then(res => res.json())
      .then(data => {
        const safePosts = data.map(p => ({
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
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(console.error);
  }, []);

=======
  // ---- Filters for the toolbar (Country / City / Date range) ----
  const [filters, setFilters] = useState({
    country: "",
    city: "",
    startDate: "",
    endDate: "",
  });

  // ---- Posts local state (replace with server data later) ----
  const [posts, setPosts] = useState(seedPosts);

  // Apply route background class when this page is mounted
>>>>>>> 57f622a5c19a9ad39fe72d8b5aa7a6e0e067d641
  useEffect(() => {
    document.body.classList.add("feed-route");
    return () => document.body.classList.remove("feed-route");
  }, []);

<<<<<<< HEAD
  // ----------------- CRUD Posts -----------------
const createPost = async (text) => {
  const newPost = {
    text: text.trim(),
    author: currentUser.id,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString()
  };

  try {
    const res = await fetch("http://localhost:5005/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost), // ✅ aquí sí se usa
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const saved = await res.json();
    saved.likes = saved.likes || [];
    saved.comments = saved.comments || [];
    setPosts((p) => [saved, ...p]);
  } catch (err) {
    console.error(err);
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
=======
  // ---------- CREATE ----------
  // Creates a new post from composer text (trim/empty guard)
  const createPost = (text) => {
    const clean = (text || "").trim();
    if (!clean) return;
    const newPost = {
      id: uid(),
      author: { ...currentUser },
      text: clean,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    // Prepend so newest appears first
    setPosts((prev) => [newPost, ...prev]);
  };

  // ---------- LIKE ----------
  // Simple like toggler (no per-user tracking here)
  const likePost = (id) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  // ---------- COMMENT ----------
  // Pushes a new comment to the post (local only)
  const addComment = (id, text) => {
    const clean = (text || "").trim();
    if (!clean) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [
                ...p.comments,
                { id: uid(), author: currentUser.name, text: clean },
              ],
>>>>>>> 57f622a5c19a9ad39fe72d8b5aa7a6e0e067d641
            }
          : p
      )
    );
  } catch (err) {
    console.error(err);
  }
};

<<<<<<< HEAD
const deletePost = async (id) => {
  try {
    await fetch(`http://localhost:5005/api/posts/${id}`, { method: "DELETE" });
    setPosts((list) => list.filter((p) => p.id !== id && p._id !== id));
  } catch (err) { console.error(err); }
};


// ----------------- Likes -----------------
const likePost = async (id) => {
  try {
    const res = await fetch(`http://localhost:5005/api/posts/${id}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUser.id }) // ⚡ enviamos el ID del usuario actual
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

// ----------------- CRUD Comentarios -----------------
const addComment = async (postId, text) => {
  const newComment = { text: text.trim(), author: currentUser, createdAt: new Date().toISOString() };
  try {
    const res = await fetch(`http://localhost:5005/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComment),
    });
    const saved = await res.json();
    setPosts((list) =>
      list.map((p) =>
        p._id === postId ? { ...p, comments: [...(p.comments || []), saved] } : p
      )
    );
  } catch (err) {
    console.error(err);
  }
};

const updateComment = async (postId, commentId, newText) => {
  try {
    const res = await fetch(`http://localhost:5005/api/posts/${postId}/comments/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });
    const updated = await res.json();
    setPosts((list) =>
      list.map((p) =>
        p._id === postId
          ? {
              ...p,
              comments: (p.comments || []).map((c) => (c._id === commentId ? updated : c)),
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
    await fetch(`http://localhost:5005/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
    setPosts((list) =>
      list.map((p) =>
        p._id === postId
          ? { ...p, comments: (p.comments || []).filter((c) => c._id !== commentId) }
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
    const okCountry = !ctry || (p.snapshot?.country || "").toLowerCase().includes(ctry);
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
      debounce("countries", () => {
        const list = countries
          .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
          .map((c) => c.name)
          .slice(0, 8);
        cb(list);
      }, 300);
    },
    [countries]
  );

  const fetchCitiesDebounced = useCallback(
    (query, countryName, cb) => {
      if (!query || !countryName) return cb([]);
      const country = countries.find((c) => c.name.toLowerCase() === countryName.toLowerCase());
      if (!country) return cb([]);
      debounce("cities", async () => {
        try {
          const res = await fetch(`${CSC_API_URL}/countries/${country.iso2}/cities?limit=20&namePrefix=${query}`, { headers: HEADERS });
          const data = await res.json();
          cb(data.map((c) => c.name));
        } catch (e) {
          console.error(e);
          cb([]);
        }
      }, 300);
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
        />
        <Autocomplete
          icon="search"
          placeholder="City"
          value={filters.city}
          onChange={(v) => setFilters((f) => ({ ...f, city: v }))}
          fetchOptions={(q, cb) => fetchCitiesDebounced(q, filters.country, cb)}
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
            onUpdateComment={(cid, text) => updateComment(post._id || post.id, cid, text)}
            onDeleteComment={(cid) => deleteComment(post._id || post.id, cid)}
            onCommentAvatarClick={(uid) => goProfile(uid)}
          />
        ))}
      </ul>
    </div>
  );
}

// =================== COMPONENTES AUXILIARES ===================
function Autocomplete({ icon, value, onChange, placeholder, fetchOptions }) {
  const [options, setOptions] = useState([]);
  const handleInput = (v) => {
    onChange(v);
    if (!v || v.length < 2) return setOptions([]);
    fetchOptions(v, setOptions);
=======
  // ---------- Toolbar handlers ----------
  const handleSearch = () => {
    // TODO: Replace with your real search (API call) using `filters`
    console.log("SEARCH with:", filters);
  };

  const handleClear = () => {
    setFilters({ country: "", city: "", startDate: "", endDate: "" });
>>>>>>> 57f622a5c19a9ad39fe72d8b5aa7a6e0e067d641
  };
  return (
<<<<<<< HEAD
    <div className="tm-field icon">
      <span className="tm-icon">{icon === "calendar" ? "📅" : "🔍"}</span>
      <input list={placeholder} value={value} placeholder={placeholder} onChange={(e) => handleInput(e.target.value)} />
      <datalist id={placeholder}>
        {options.map((opt, index) => (<option key={`${opt}-${index}`} value={opt} />))}
      </datalist>
      {value && <button className="tm-clear" onClick={() => handleInput("")}>×</button>}
    </div>
  );
}

function PostComposer({ onSubmit, currentUser }) {
  const [text, setText] = useState("");
  const submit = (e) => { e.preventDefault(); if (!text.trim()) return; onSubmit(text); setText(""); };
  return (
    <form className="tm-composer" onSubmit={submit}>
      <img src={currentUser.photo || defaultAvatar} alt="You" className="tm-avatar" />
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share something..." />
      <button type="submit" disabled={!text.trim()}>Post</button>
=======
    <main className="feed-page">
      {/* ==================== FILTER TOOLBAR ==================== */}
      <div className="feed-toolbar">
        {/* Country */}
        <div className="filter-wrap">
          <svg className="filter-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="filter-pill filter-input">
            <input
              id="country-input"
              type="text"
              placeholder="Country"
              value={filters.country}
              onChange={(e) =>
                setFilters((f) => ({ ...f, country: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="filter-wrap">
          <svg className="filter-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div className="filter-pill filter-input">
            <input
              id="city-input"
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) =>
                setFilters((f) => ({ ...f, city: e.target.value }))
              }
            />
          </div>
        </div>

        {/* Date range (um único botão com calendário) */}
        <RangePicker
          value={{ startDate: filters.startDate, endDate: filters.endDate }}
          onChange={({ startDate, endDate }) =>
            setFilters((f) => ({ ...f, startDate, endDate }))
          }
          label="Start date — End date"
        />

        {/* Actions */}
        <div className="actions">
          <button type="button" className="ghost-btn" onClick={handleClear}>
            Clear
          </button>
          <button type="button" className="primary-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>
      {/* ================== END FILTER TOOLBAR ================== */}

      {/* ==================== COMPOSER ==================== */}
      <Composer onSubmit={createPost} />

      {/* ==================== POSTS LIST ==================== */}
      <section
        className="posts-list"
        style={{ width: "min(800px,92%)", margin: "20px auto" }}
      >
        {posts.map((p) => (
          <article
            key={p.id}
            className="post-card"
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
            }}
          >
            {/* Header with avatar and author */}
            <header
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <button
                aria-label={`Open ${p.author.name} profile`}
                onClick={() => navigate(`/users/${p.author.id}`)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px solid #e5e7eb",
                  background: "#f3f4f6",
                  cursor: "pointer",
                }}
                title="Open profile"
              />
              <div>
                <div style={{ fontWeight: 600 }}>{p.author.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
            </header>

            {/* Post text */}
            <p style={{ margin: "8px 0 12px 0", lineHeight: 1.55 }}>{p.text}</p>

            {/* Actions (like + comment inline) */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className="pill"
                onClick={() => likePost(p.id)}
                aria-label="Like post"
              >
                {" "}
                <img src={likeIcon} alt="Like" className="icon-like" />
                {p.likes}
              </button>
            </div>

            {/* Simple comment form */}
            <InlineComment onSubmit={(txt) => addComment(p.id, txt)} />

            {/* Comments list */}
            {p.comments.length > 0 && (
              <ul style={{ marginTop: 8, paddingLeft: 16 }}>
                {p.comments.map((c) => (
                  <li key={c.id} style={{ margin: "6px 0" }}>
                    <strong>{c.author}:</strong> {c.text}
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

/* ==================== SMALL INTERNAL COMPONENTS ==================== */

// Minimal Composer with a single textarea and submit
function Composer({ onSubmit }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
    setValue("");
  };

  return (
    <section style={{ width: "min(800px,92%)", margin: "20px auto" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 16,
          display: "grid",
          gap: 12,
        }}
      >
        <label htmlFor="composer" style={{ fontWeight: 600 }}>
          Create a post
        </label>
        <textarea
          id="composer"
          rows={3}
          placeholder="What's on your mind?"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: "100%",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: 12,
            resize: "vertical",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="submit" className="primary-btn">
            Post
          </button>
        </div>
      </form>
    </section>
  );
}

// Minimal inline comment input
function InlineComment({ onSubmit }) {
  const [txt, setTxt] = useState("");

  const send = (e) => {
    e.preventDefault();
    onSubmit?.(txt);
    setTxt("");
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
>>>>>>> 57f622a5c19a9ad39fe72d8b5aa7a6e0e067d641
    </form>
  );
}

<<<<<<< HEAD
function PostCard({ post, currentUser, onAvatarClick, onLike, onUpdate, onDelete, onAddComment, onUpdateComment, onDeleteComment, onCommentAvatarClick }) {
  const author = { id: post.author, name: "User", photo: defaultAvatar };
  const isOwner = currentUser.id === author.id;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.comment || post.text || "");

  const saveEdit = () => { const t = draft.trim(); if (!t) return; onUpdate({ comment: t }); setEditing(false); };

  return (
  <li className="tm-post">
    <div className="tm-post-head">
      <button onClick={onAvatarClick}>
        <img src={author.photo || defaultAvatar} alt={author.name} className="tm-avatar" />
      </button>
      <div>
        <strong>{author.name}</strong>
        <span>{post.createdAt ? new Date(post.createdAt).toLocaleString() : "Unknown date"}</span>
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
          <button onClick={() => { setEditing(false); setDraft(post.comment || post.text || ""); }}>Cancel</button>
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
      <button onClick={onLike}>❤️{post.likes?.length || 0}</button>
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

function Comments({ comments, currentUser, onAdd, onUpdate, onDelete, onAvatarClick }) {
  const [text, setText] = useState("");
  const submit = (e) => { e.preventDefault(); if (!text.trim()) return; onAdd(text); setText(""); };
  return (
    <div className="tm-comments">
      {comments.map((c) => (
        <CommentItem
          key={c._id}
          comment={c}
          mine={c.author === currentUser.id}
          onUpdate={(txt) => onUpdate(c._id, txt)}
          onDelete={() => onDelete(c._id)}
          onAvatarClick={() => onAvatarClick(c.author)}
        />
      ))}
      <form className="tm-comment-form" onSubmit={submit}>
        <img src={currentUser.photo || defaultAvatar} alt="You" className="tm-avatar sm" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment..." />
        <button disabled={!text.trim()}>Send</button>
      </form>
    </div>
  );
}

function CommentItem({ comment, mine, onUpdate, onDelete, onAvatarClick }) {
  const author = { id: comment.author, name: "User", photo: defaultAvatar };
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text || "");

  const save = () => { const t = draft.trim(); if (!t) return; onUpdate(t); setEditing(false); };

  return (
    <div className="tm-comment">
      <button onClick={onAvatarClick}><img src={author.photo || defaultAvatar} alt={author.name} className="tm-avatar sm" /></button>
      <div>
        <strong>{author.name}</strong>
        <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : "Unknown date"}</span>
        {mine && !editing && <><button onClick={() => setEditing(true)}>Edit</button><button onClick={onDelete}>Delete</button></>}
        {mine && editing && <><button onClick={save}>Save</button><button onClick={() => { setEditing(false); setDraft(comment.text || ""); }}>Cancel</button></>}
        {!editing && <p>{comment.text}</p>}
        {editing && <textarea value={draft} onChange={(e) => setDraft(e.target.value)} />}
      </div>
    </div>
  );
}
=======
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
    <div style={{ position: "relative" }} ref={ref}>
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

/* ==================== DEMO DATA / HELPERS (replace later) ==================== */

const demoUser = {
  id: "u_001",
  name: "Demo User",
};

const seedPosts = [
  {
    id: "p_001",
    author: { id: "u_002", name: "Ava" },
    text: "Welcome to Trip Match feed! 🚀",
    likes: 2,
    comments: [{ id: "c_1", author: "Liam", text: "Looks great!" }],
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "p_002",
    author: { id: "u_003", name: "Noah" },
    text: "Anyone in Madrid this weekend?",
    likes: 1,
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

// Tiny unique id generator (front-only)
function uid() {
  return (
    Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
  );
}
>>>>>>> 57f622a5c19a9ad39fe72d8b5aa7a6e0e067d641
