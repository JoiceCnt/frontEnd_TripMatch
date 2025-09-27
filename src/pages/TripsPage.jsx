// src/pages/TripsPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./Trips.css";

/* --------- Icons --------- */
import tripIcon from "../assets/Iconos/trip.png";
import upcomingIcon from "../assets/Iconos/upcoming.png";
import planIcon from "../assets/Iconos/plan.png";
import uploadIcon from "../assets/Iconos/upload.png";
import shareIcon from "../assets/Iconos/share.png";
import addIcon from "../assets/Iconos/add.png";
import downloadIcon from "../assets/Iconos/download.png";
import editIcon from "../assets/Iconos/edit.png";
import deleteIcon from "../assets/Iconos/delete.png";
import saveIcon from "../assets/Iconos/save.png";
import pastIcon from "../assets/Iconos/past.png";

/* ===================== Date utils ===================== */
// Accepts "DD/MM/YYYY" or "YYYY-MM-DD"
function parseDateInput(x) {
  if (x instanceof Date) return x;
  if (typeof x === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return new Date(`${x}T00:00:00`);
    const m = x.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  }
  return new Date(x);
}

// Normalize to local date-only
const dateOnly = (x) => {
  const d = parseDateInput(x);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

// Status: upcoming / active / past
function getTripStatus(trip) {
  const s = dateOnly(trip.startDate);
  const e = dateOnly(trip.endDate || trip.startDate);
  const today = dateOnly(new Date());
  if (today < s) return "upcoming";
  if (today > e) return "past";
  return "active";
}

// Helpers
const toISOInput = (d) => {
  const x = parseDateInput(d);
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${mm}-${dd}`;
};
const fromDateInput = (value) => value;

/* ===================== UI ===================== */
function SectionHeader({ icon, label, right }) {
  return (
    <div className="trip-section-header">
      <div className="left">
        <img className="icon-img" src={icon} alt="" aria-hidden />
        <span>{label}</span>
      </div>
      <div className="right">{right}</div>
    </div>
  );
}

/* Trip card */
function TripCard({
  trip,
  onShare,
  onSaveChanges,
  onDeleteTrip,
  onAddDoc,
  onDeleteDoc,
  onRenameDoc,
}) {
  const [bgImage, setBgImage] = useState(null);
  const inputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(trip);

  const [renamingDoc, setRenamingDoc] = useState(null);
  const [newDocName, setNewDocName] = useState("");

  const pickImage = () => inputRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setBgImage(url);
    e.target.value = "";
  };

  const togglePref = (p) => {
    const has = draft.preferences?.includes(p);
    const prefs = has
      ? draft.preferences.filter((x) => x !== p)
      : [...(draft.preferences || []), p];
    setDraft({ ...draft, preferences: prefs });
  };

  const confirmSave = () => {
    onSaveChanges(trip._id, {
      title: draft.title?.trim() || "Untitled trip",
      city: draft.city?.trim() || "",
      country: draft.country?.trim() || "",
      startDate: draft.startDate,
      endDate: draft.endDate || draft.startDate,
      preferences: draft.preferences || [],
      activities: draft.activities || [],
      documents: draft.documents || [],
    });
    setEditing(false);
  };

  const cancelEdit = () => {
    setDraft(trip);
    setEditing(false);
  };

  return (
    <div className="trip-card">
      {/* HERO */}
      <div
        className="trip-hero"
        style={{ backgroundImage: bgImage ? `url(${bgImage})` : "none" }}
      >
        {bgImage && <div className="trip-hero-scrim" aria-hidden />}

        <div className="trip-hero-left">
          {editing ? (
            <>
              <input
                className="trip-title-input"
                value={draft.title || ""}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Trip title"
              />
              <div className="trip-meta">
                <input
                  className="meta-input"
                  value={draft.city || ""}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  placeholder="City"
                />
                <span className="dot" />
                <input
                  className="meta-input"
                  value={draft.country || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, country: e.target.value })
                  }
                  placeholder="Country"
                />
                <span className="dot" />
                <span className="date-row">
                  <input
                    type="date"
                    value={toISOInput(draft.startDate)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        startDate: fromDateInput(e.target.value),
                      })
                    }
                  />
                  <span>→</span>
                  <input
                    type="date"
                    value={toISOInput(draft.endDate || draft.startDate)}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        endDate: fromDateInput(e.target.value),
                      })
                    }
                  />
                </span>
              </div>
            </>
          ) : (
            <>
              <h3 className="trip-title">{trip.title}</h3>
              <div className="trip-meta">
                <span>
                  {trip.city}, {trip.country}
                </span>
                <span className="dot" />
                <span>
                  From {toISOInput(trip.startDate)} to{" "}
                  {toISOInput(trip.endDate)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="trip-hero-right">
          <button className="tm-btn ghost" onClick={pickImage}>
            <img className="icon-img" src={uploadIcon} alt="" aria-hidden />
            <span>Upload image</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={onFileChange}
          />

          {!editing ? (
            <>
              <button className="tm-btn" onClick={() => onShare(trip)}>
                <img className="icon-img" src={shareIcon} alt="" aria-hidden />
                <span>Share</span>
              </button>
              <button
                className="tm-btn ghost"
                onClick={() => {
                  setDraft(trip);
                  setEditing(true);
                }}
              >
                <img className="icon-img" src={editIcon} alt="" aria-hidden />
                <span>Update</span>
              </button>
              <button
                className="tm-btn ghost"
                onClick={() => onDeleteTrip(trip._id)}
              >
                <img className="icon-img" src={deleteIcon} alt="" aria-hidden />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button className="tm-btn ghost" onClick={cancelEdit}>
                Cancel
              </button>
              <button className="tm-btn" onClick={confirmSave}>
                <img className="icon-img" src={saveIcon} alt="" aria-hidden />
                <span>Save</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="trip-details">
        <div className="activities">
          <div className="panel-title">
            <img className="icon-img" src={saveIcon} alt="" aria-hidden />
            <span>Activities</span>
          </div>

          {!editing ? (
            <div className="activity-list">
              {trip.activities?.map((a, i) => (
                <div className="activity-item" key={i}>
                  {a}
                </div>
              ))}
              {!trip.activities?.length && (
                <div className="empty">No activities</div>
              )}
            </div>
          ) : (
            <div className="activity-edit">
              <textarea
                value={(draft.activities || []).join("\n")}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    activities: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={
                  "One activity per line (e.g. 20/10/2025 10:00 Colosseum)"
                }
              />
            </div>
          )}
        </div>

        <div className="preferences">
          <div className="panel-title">
            <img className="icon-img" src={editIcon} alt="" aria-hidden />
            <span>Preferences</span>
          </div>
          <ul className="pref-list">
            {["Nature", "Concerts & Events", "Gastronomy", "Touristic places"].map(
              (p) => (
                <li key={p}>
                  {editing ? (
                    <label className="pref-check">
                      <input
                        type="checkbox"
                        checked={draft.preferences?.includes(p) || false}
                        onChange={() => togglePref(p)}
                      />
                      <span>{p}</span>
                    </label>
                  ) : (
                    <label className="pref-check">
                      <input type="checkbox" checked readOnly />
                      <span>{p}</span>
                    </label>
                  )}
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Documents */}
      <div className="trip-docs">
        <div className="doc-actions">
          <button className="chip">
            <img className="icon-img" src={downloadIcon} alt="" aria-hidden />
            <span>Outbound</span>
          </button>
          <button className="chip">
            <img className="icon-img" src={downloadIcon} alt="" aria-hidden />
            <span>Return</span>
          </button>
        </div>

        <div className="doc-list">
          {(trip.documents || []).map((d, i) => (
            <div className="doc-item" key={i}>
              <img className="icon-img" src={downloadIcon} alt="" />
              {renamingDoc === i && editing ? (
                <input
                  className="doc-input"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const name = newDocName.trim();
                      if (name) onRenameDoc(trip._id, i, name);
                      setRenamingDoc(null);
                      setNewDocName("");
                    } else if (e.key === "Escape") {
                      setRenamingDoc(null);
                      setNewDocName("");
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span className="doc-name">{d}</span>
              )}

              <div className="doc-cta">
                {editing ? (
                  <>
                    {renamingDoc === i ? null : (
                      <button
                        className="icon-only"
                        title="Rename"
                        onClick={() => {
                          setRenamingDoc(i);
                          setNewDocName(d);
                        }}
                      >
                        <img className="icon-img" src={editIcon} alt="" />
                      </button>
                    )}
                    <button
                      className="icon-only"
                      title="Delete"
                      onClick={() => onDeleteDoc(trip._id, i)}
                    >
                      <img className="icon-img" src={deleteIcon} alt="" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          ))}

          {editing ? (
            <button
              className="chip ghost"
              onClick={() => {
                const name = prompt("Document name (e.g. Tickets.pdf):");
                if (name && name.trim()) onAddDoc(trip._id, name.trim());
              }}
            >
              <img className="icon-img" src={addIcon} alt="" aria-hidden />
              <span>Add a new document</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ===================== Page ===================== */
export default function TripsPage() {
  const scrollToId = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* Share modal */
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTrip, setShareTrip] = useState(null);
  const [shareComment, setShareComment] = useState("");
  const [shareIncludePrefs, setShareIncludePrefs] = useState(true);

  const openShare = (trip) => {
    setShareTrip(trip);
    setShareOpen(true);
  };
  const closeShare = () => setShareOpen(false);

  /* Backend state */
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch trips
  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5005/api/trips");
        if (!res.ok) throw new Error("Failed to fetch trips");
        const data = await res.json();
        setTrips(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  // CRUD handlers
  const addTrip = async (payload) => {
    try {
      const res = await fetch("http://localhost:5005/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      const newTrip = await res.json();
      setTrips((prev) => [newTrip, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTrip = async (id, payload) => {
    try {
      const res = await fetch(`http://localhost:5005/api/trips/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update trip");
      const updated = await res.json();
      setTrips((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTrip = async (id) => {
    const ok = confirm("Delete this trip?");
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:5005/api/trips/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete trip");
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Docs
  const addDoc = (id, name) => {
    setTrips((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, documents: [...(t.documents || []), name] } : t
      )
    );
  };
  const deleteDoc = (id, index) => {
    setTrips((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, documents: t.documents.filter((_, i) => i !== index) }
          : t
      )
    );
  };
  const renameDoc = (id, index, name) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t._id !== id) return t;
        const docs = [...(t.documents || [])];
        docs[index] = name;
        return { ...t, documents: docs };
      })
    );
  };

  /* Status partitions */
  const activeTrips = useMemo(
    () => trips.filter((t) => getTripStatus(t) === "active"),
    [trips]
  );
  const upcomingTrips = useMemo(
    () => trips.filter((t) => getTripStatus(t) === "upcoming"),
    [trips]
  );
  const pastTrips = useMemo(
    () => trips.filter((t) => getTripStatus(t) === "past"),
    [trips]
  );

  const [pastCollapsed, setPastCollapsed] = useState(false);

  /* Plan form state */
  const [form, setForm] = useState({
    title: "",
    city: "",
    country: "",
    from: "",
    to: "",
    prefs: [],
  });

  const togglePref = (p) =>
    setForm((f) => {
      const has = f.prefs.includes(p);
      return { ...f, prefs: has ? f.prefs.filter((x) => x !== p) : [...f.prefs, p] };
    });

  const submitPlan = (e) => {
    e.preventDefault();
    if (!form.title || !form.city || !form.country || !form.from) {
      alert("Please fill required fields");
      return;
    }
    addTrip({
      title: form.title.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      startDate: form.from,
      endDate: form.to || form.from,
      preferences: form.prefs,
      activities: [],
      documents: [],
    });
    setForm({ title: "", city: "", country: "", from: "", to: "", prefs: [] });
  };

  return (
    <div className="trips-page">
      {/* HEADER */}
      <header className="trips-header">
        <img src={tripIcon} alt="" className="icon-img" />
        <h2>My Trips</h2>
        <nav>
          <button onClick={() => scrollToId("plan")}>
            <img src={planIcon} alt="" className="icon-img" />
            <span>Plan a new trip</span>
          </button>
          <button onClick={() => scrollToId("active")}>
            <img src={tripIcon} alt="" className="icon-img" />
            <span>Active</span>
          </button>
          <button onClick={() => scrollToId("upcoming")}>
            <img src={upcomingIcon} alt="" className="icon-img" />
            <span>Upcoming</span>
          </button>
          <button onClick={() => scrollToId("past")}>
            <img src={pastIcon} alt="" className="icon-img" />
            <span>Past</span>
          </button>
        </nav>
      </header>

      {/* ERROR */}
      {error && <div className="error-banner">{error}</div>}

      {/* PLAN */}
      <section id="plan" className="plan-section">
        <SectionHeader icon={planIcon} label="Plan a new trip" />
        <form className="trip-form" onSubmit={submitPlan}>
          <div className="row">
            <label>
              Title
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>
            <label>
              City
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </label>
            <label>
              Country
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              />
            </label>
          </div>
          <div className="row">
            <label>
              From
              <input
                type="date"
                value={form.from}
                onChange={(e) => setForm({ ...form, from: e.target.value })}
                required
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
              />
            </label>
          </div>
          <div className="row prefs">
            {["Nature", "Concerts & Events", "Gastronomy", "Touristic places"].map(
              (p) => (
                <label key={p} className="pref-check">
                  <input
                    type="checkbox"
                    checked={form.prefs.includes(p)}
                    onChange={() => togglePref(p)}
                  />
                  <span>{p}</span>
                </label>
              )
            )}
          </div>
          <button type="submit" className="tm-btn">
            <img src={planIcon} alt="" className="icon-img" />
            <span>Create trip</span>
          </button>
        </form>
      </section>

      {/* ACTIVE */}
      <section id="active">
        <SectionHeader icon={tripIcon} label="Active trips" />
        {loading ? (
          <div className="loading">Loading trips...</div>
        ) : !activeTrips.length ? (
          <div className="empty">No active trips</div>
        ) : (
          <div className="trip-list">
            {activeTrips.map((t) => (
              <TripCard
                key={t._id}
                trip={t}
                onShare={openShare}
                onSaveChanges={updateTrip}
                onDeleteTrip={deleteTrip}
                onAddDoc={addDoc}
                onDeleteDoc={deleteDoc}
                onRenameDoc={renameDoc}
              />
            ))}
          </div>
        )}
      </section>

      {/* UPCOMING */}
      <section id="upcoming">
        <SectionHeader icon={upcomingIcon} label="Upcoming trips" />
        {!upcomingTrips.length ? (
          <div className="empty">No upcoming trips</div>
        ) : (
          <div className="trip-list">
            {upcomingTrips.map((t) => (
              <TripCard
                key={t._id}
                trip={t}
                onShare={openShare}
                onSaveChanges={updateTrip}
                onDeleteTrip={deleteTrip}
                onAddDoc={addDoc}
                onDeleteDoc={deleteDoc}
                onRenameDoc={renameDoc}
              />
            ))}
          </div>
        )}
      </section>

      {/* PAST */}
      <section id="past">
        <SectionHeader
          icon={pastIcon}
          label="Past trips"
          right={
            <button
              className="tm-btn ghost"
              onClick={() => setPastCollapsed((c) => !c)}
            >
              {pastCollapsed ? "Expand" : "Collapse"}
            </button>
          }
        />
        {!pastTrips.length ? (
          <div className="empty">No past trips</div>
        ) : pastCollapsed ? null : (
          <div className="trip-list">
            {pastTrips.map((t) => (
              <TripCard
                key={t._id}
                trip={t}
                onShare={openShare}
                onSaveChanges={updateTrip}
                onDeleteTrip={deleteTrip}
                onAddDoc={addDoc}
                onDeleteDoc={deleteDoc}
                onRenameDoc={renameDoc}
              />
            ))}
          </div>
        )}
      </section>

      {/* SHARE MODAL */}
      {shareOpen && shareTrip && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Share “{shareTrip.title}”</h3>
            <textarea
              placeholder="Message…"
              value={shareComment}
              onChange={(e) => setShareComment(e.target.value)}
            />
            <label className="pref-check">
              <input
                type="checkbox"
                checked={shareIncludePrefs}
                onChange={(e) => setShareIncludePrefs(e.target.checked)}
              />
              <span>Include preferences</span>
            </label>
            <div className="modal-actions">
              <button className="tm-btn ghost" onClick={closeShare}>
                Cancel
              </button>
              <button
                className="tm-btn"
                onClick={() => {
                  alert("Trip shared!");
                  closeShare();
                }}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
