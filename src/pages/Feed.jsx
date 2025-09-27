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

export default function Feed({ currentUser = demoUser }) {
  const navigate = useNavigate();

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
  useEffect(() => {
    document.body.classList.add("feed-route");
    return () => document.body.classList.remove("feed-route");
  }, []);

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
            }
          : p
      )
    );
  };

  // ---------- Toolbar handlers ----------
  const handleSearch = () => {
    // TODO: Replace with your real search (API call) using `filters`
    console.log("SEARCH with:", filters);
  };

  const handleClear = () => {
    setFilters({ country: "", city: "", startDate: "", endDate: "" });
  };

  return (
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
    </form>
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
