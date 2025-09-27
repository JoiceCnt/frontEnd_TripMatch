import { useEffect, useMemo, useState } from "react";

/** Simple GET util with optional JWT token */
async function getJSON(url, token) {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

/** Merge all sources and return normalized activity items */
function buildActivity({
  likes = [],
  comments = [],
  posts = [],
  postsById = {},
}) {
  const items = [];

  // Likes → become "like" activities
  for (const lk of likes) {
    const p = postsById[lk.post] || null;
    items.push({
      type: "like",
      createdAt: lk.createdAt || lk.updatedAt,
      post: p
        ? { id: p.id || p._id, title: p.title, coverUrl: p.coverUrl }
        : { id: lk.post },
    });
  }

  // Comments → "comment"
  for (const cm of comments) {
    const p = postsById[cm.post] || null;
    items.push({
      type: "comment",
      createdAt: cm.createdAt || cm.updatedAt,
      comment: { id: cm.id || cm._id, text: cm.text },
      post: p
        ? { id: p.id || p._id, title: p.title, coverUrl: p.coverUrl }
        : { id: cm.post },
    });
  }

  // (Optional) User's own posts → "post"
  for (const po of posts) {
    items.push({
      type: "post",
      createdAt: po.createdAt || po.updatedAt,
      post: { id: po.id || po._id, title: po.title, coverUrl: po.coverUrl },
    });
  }

  // Sort by date desc
  return items
    .filter((i) => i.createdAt)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export default function ActivitiesPage({ userId, apiBase = "/api", token }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [data, setData] = useState({
    likes: [],
    comments: [],
    posts: [],
    postsById: {},
  });

  useEffect(() => {
    let cancel = false;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        // 1) Fetch likes, comments and (optional) user's own posts
        const [likes, comments, ownPosts] = await Promise.all([
          getJSON(`${apiBase}/likes?userId=${userId}`, token),
          getJSON(`${apiBase}/comments?author=${userId}`, token),
          // If you don't want to show "published", replace with []
          getJSON(`${apiBase}/posts?author=${userId}`, token),
        ]);

        // 2) Collect unique postIds from likes + comments
        const postIds = Array.from(
          new Set(
            [
              ...likes.map((l) => l.post),
              ...comments.map((c) => c.post),
            ].filter(Boolean)
          )
        );

        // 3) Fetch posts in batch (ideal). If not available:
        //    - fallback to Promise.all GET /posts/:id
        let postsBatch = [];
        if (postIds.length) {
          try {
            // Try a batch endpoint first
            postsBatch = await getJSON(
              `${apiBase}/posts?ids=${postIds.join(",")}`,
              token
            );
          } catch {
            // Fallback: multiple requests (less efficient)
            postsBatch = await Promise.all(
              postIds.map((id) => getJSON(`${apiBase}/posts/${id}`, token))
            );
          }
        }

        // 4) Index posts by id
        const postsById = {};
        for (const p of postsBatch) {
          const pid = p.id || p._id;
          postsById[pid] = p;
        }

        if (!cancel) {
          setData({ likes, comments, posts: ownPosts, postsById });
        }
      } catch (e) {
        if (!cancel) setErr(e.message || "Failed to load activities.");
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    if (userId) load();
    return () => {
      cancel = true;
    };
  }, [userId, apiBase, token]);

  const items = useMemo(() => buildActivity(data), [data]);

  if (!userId)
    return (
      <div style={{ padding: 16 }}>Please sign in to see your activities.</div>
    );
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!items.length)
    return <div style={{ padding: 16 }}>No activities yet.</div>;

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      {items.map((it, idx) => (
        <article
          key={idx}
          style={{
            border: "1px solid #e3e6e8",
            borderRadius: 12,
            padding: 12,
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {new Date(it.createdAt).toLocaleString()}
          </div>

          <div style={{ fontWeight: 600, marginTop: 6 }}>
            {it.type === "like" && "You liked a post"}
            {it.type === "comment" && "You commented on a post"}
            {it.type === "post" && "You published a post"}
          </div>

          {it.post && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 14 }}>
                {it.post.title || `Post #${it.post.id}`}
              </div>
              {it.post.coverUrl && (
                <img
                  src={it.post.coverUrl}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginTop: 6,
                  }}
                />
              )}
            </div>
          )}

          {it.comment?.text && (
            <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.4 }}>
              “{it.comment.text}”
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
