import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Feed.css";

const defaultAvatar = "https://raw.githubusercontent.com/feathericons/feather/master/icons/user.svg";
const demoUser = { id: "507f1f77bcf86cd799439011", name: "You", photo: "" };
const CSC_API_URL = "https://api.countrystatecity.in/v1";
const CSC_API_KEY = "eDZSRUZZSlhUMGpkNm1GUXVwUXN5REIxSGF3YldESllpaXhuWUM4RA==";
const HEADERS = { "X-CSCAPI-KEY": CSC_API_KEY };

export default function Feed({ currentUser = demoUser }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ country: "", city: "", startDate: "", endDate: "" });
  const [posts, setPosts] = useState([]);
  const [countries, setCountries] = useState([]);

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

  useEffect(() => {
    document.body.classList.add("feed-route");
    return () => document.body.classList.remove("feed-route");
  }, []);

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
  };
  return (
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
    </form>
  );
}

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
