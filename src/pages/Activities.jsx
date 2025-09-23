import { useEffect, useMemo, useState } from "react";

/** Util simples de GET com token (se usar JWT) */
async function getJSON(url, token) {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return res.json();
}

/** Junta tudo e devolve items normalizados */
function buildActivity({
  likes = [],
  comments = [],
  posts = [],
  postsById = {},
}) {
  const items = [];

  // Likes → viram activities do tipo "like"
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

  // (Opcional) Posts do próprio usuário → "post"
  for (const po of posts) {
    items.push({
      type: "post",
      createdAt: po.createdAt || po.updatedAt,
      post: { id: po.id || po._id, title: po.title, coverUrl: po.coverUrl },
    });
  }

  // Ordena por data desc
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
        // 1) Busca likes, comments e (opcional) posts do próprio user
        const [likes, comments, ownPosts] = await Promise.all([
          getJSON(`${apiBase}/likes?userId=${userId}`, token),
          getJSON(`${apiBase}/comments?author=${userId}`, token),
          // Se não quiser mostrar "publicou", troque por []
          getJSON(`${apiBase}/posts?author=${userId}`, token),
        ]);

        // 2) Coleta postIds únicos de likes+comments
        const postIds = Array.from(
          new Set(
            [
              ...likes.map((l) => l.post),
              ...comments.map((c) => c.post),
            ].filter(Boolean)
          )
        );

        // 3) Traz posts em lote (ideal). Se não existir:
        //    - faça Promise.all de GET /posts/:id
        let postsBatch = [];
        if (postIds.length) {
          // Tente primeiro um endpoint em lote
          try {
            postsBatch = await getJSON(
              `${apiBase}/posts?ids=${postIds.join(",")}`,
              token
            );
          } catch {
            // Fallback: várias chamadas (menos eficiente)
            postsBatch = await Promise.all(
              postIds.map((id) => getJSON(`${apiBase}/posts/${id}`, token))
            );
          }
        }

        // 4) Indexa posts por id
        const postsById = {};
        for (const p of postsBatch) {
          const pid = p.id || p._id;
          postsById[pid] = p;
        }

        if (!cancel) {
          setData({ likes, comments, posts: ownPosts, postsById });
        }
      } catch (e) {
        if (!cancel) setErr(e.message || "Erro ao carregar atividades.");
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
    return <div style={{ padding: 16 }}>Entre para ver suas atividades.</div>;
  if (loading) return <div style={{ padding: 16 }}>Carregando…</div>;
  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!items.length)
    return <div style={{ padding: 16 }}>Sem atividades por enquanto.</div>;

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
            {it.type === "like" && "Você curtiu um post"}
            {it.type === "comment" && "Você comentou um post"}
            {it.type === "post" && "Você publicou um post"}
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
