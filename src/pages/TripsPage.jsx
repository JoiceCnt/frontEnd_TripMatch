// src/pages/TripPage.jsx
import { useMemo, useRef, useState } from "react";
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
const fromDateInput = (value) => value; // keep as 'YYYY-MM-DD' for simplicity

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

/* Trip card with internal draft state for editing */
function TripCard({
  trip,
  onShare,
  onSaveChanges, // (id, payload)
  onDeleteTrip, // (id)
  onAddDoc, // (id, docName)
  onDeleteDoc, // (id, docIndex)
  onRenameDoc, // (id, docIndex, newName)
}) {
  const [bgImage, setBgImage] = useState(null);
  const inputRef = useRef(null);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(trip);

  // Keep draft in sync if trip changes from parent
  // (useful when you plug a backend and list updates externally)
  // eslint-disable-next-line
  const refreshDraft = () => setDraft(trip);

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

  const [renamingDoc, setRenamingDoc] = useState(null);
  const [newDocName, setNewDocName] = useState("");

  const confirmSave = () => {
    onSaveChanges(trip.id, {
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
          <button
            className="tm-btn ghost"
            onClick={pickImage}
            title="Upload background image"
          >
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
              <button
                className="tm-btn"
                onClick={() => onShare(trip)}
                title="Share to feed"
              >
                <img className="icon-img" src={shareIcon} alt="" aria-hidden />
                <span>Share</span>
              </button>
              <button
                className="tm-btn ghost"
                onClick={() => {
                  setDraft(trip);
                  setEditing(true);
                }}
                title="Edit trip"
              >
                <img className="icon-img" src={editIcon} alt="" aria-hidden />
                <span>Update</span>
              </button>
              <button
                className="tm-btn ghost"
                onClick={() => onDeleteTrip(trip.id)}
                title="Delete trip"
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
            {[
              "Nature",
              "Concerts & Events",
              "Gastronomy",
              "Touristic places",
            ].map((p) => (
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
            ))}
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
                      if (name) onRenameDoc(trip.id, i, name);
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
                      onClick={() => onDeleteDoc(trip.id, i)}
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
                if (name && name.trim()) onAddDoc(trip.id, name.trim());
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
export default function TripPage() {
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
  const confirmShare = () => {
    // TODO: POST /api/feed with trip summary
    console.log("SHARE ▶", {
      trip: shareTrip,
      comment: shareComment.trim(),
      includePreferences: shareIncludePrefs,
    });
    setShareComment("");
    setShareIncludePrefs(true);
    setShareOpen(false);
  };

  /* Trips state (editable) */
  const [trips, setTrips] = useState([
    {
      id: "t1",
      title: "Barcelona Getaway",
      city: "Barcelona",
      country: "Spain",
      startDate: "2025-09-19",
      endDate: "2025-09-22",
      preferences: [
        "Nature",
        "Concerts & Events",
        "Gastronomy",
        "Touristic places",
      ],
      activities: [
        "2025-09-19 15:00 Sagrada Família",
        "2025-09-20 12:00 Park Güell",
        "2025-09-20 18:00 La Boqueria",
        "2025-09-20 16:00 Casa Batlló",
      ],
      documents: [
        "Sagrada Familia tickets.pdf",
        "Park Güell tickets.pdf",
        "Casa Batlló tickets.pdf",
      ],
    },
    {
      id: "t2",
      title: "Beautiful Rome",
      city: "Rome",
      country: "Italy",
      startDate: "2025-10-22",
      endDate: "2025-10-28",
      preferences: [
        "Nature",
        "Concerts & Events",
        "Gastronomy",
        "Touristic places",
      ],
      activities: [
        "2025-10-22 15:00 Flight",
        "2025-10-23 10:30 Colosseum",
        "2025-10-28 16:00 Flight return",
      ],
      documents: ["Colosseum tickets.pdf"],
    },
    {
      id: "t3",
      title: "Lisbon Weekend",
      city: "Lisbon",
      country: "Portugal",
      startDate: "2025-04-10",
      endDate: "2025-04-12",
      preferences: ["Gastronomy", "Touristic places"],
      activities: [
        "2025-04-11 11:00 Tram 28",
        "2025-04-11 18:00 Time Out Market",
      ],
      documents: [],
    },
  ]);

  /* CRUD handlers (use these to plug your API later) */
  const updateTrip = (id, payload) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...payload } : t))
    );
    // TODO: await fetch(`/api/trips/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  };
  const deleteTrip = (id) => {
    const ok = confirm("Delete this trip?");
    if (!ok) return;
    setTrips((prev) => prev.filter((t) => t.id !== id));
    // TODO: await fetch(`/api/trips/${id}`, { method: 'DELETE' })
  };
  const addTrip = (payload) => {
    const id = `t_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const newTrip = { id, ...payload };
    setTrips((prev) => [newTrip, ...prev]);
    // TODO: await fetch('/api/trips', { method: 'POST', body: JSON.stringify(newTrip) })
  };

  // Docs
  const addDoc = (id, name) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, documents: [...(t.documents || []), name] } : t
      )
    );
  };
  const deleteDoc = (id, index) => {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, documents: t.documents.filter((_, i) => i !== index) }
          : t
      )
    );
  };
  const renameDoc = (id, index, name) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
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

  /* Collapsible past */
  const [pastCollapsed, setPastCollapsed] = useState(false);

  /* Plan form state */
  const [form, setForm] = useState({
    title: "",
    city: "",
    country: "",
    from: "",
    to: "",
    prefs: new Set(),
  });

  const submitPlan = (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim() || "Untitled trip",
      city: form.city.trim(),
      country: form.country.trim(),
      startDate: form.from || form.to || toISOInput(new Date()),
      endDate: form.to || form.from || form.from,
      preferences: Array.from(form.prefs),
      activities: [],
      documents: [],
    };
    addTrip(payload);
    // reset
    setForm({
      title: "",
      city: "",
      country: "",
      from: "",
      to: "",
      prefs: new Set(),
    });
    // Optional: scroll to the right section
    // scrollToId("section-upcoming");
  };

  return (
    <main className="trip-page">
      {/* TOP TABS */}
      <div className="section-nav">
        <button
          className="tab-btn"
          onClick={() => scrollToId("section-active")}
        >
          <img className="icon-img" src={tripIcon} alt="" aria-hidden />
          <span>Active trip</span>
        </button>

        <button
          className="tab-btn"
          onClick={() => scrollToId("section-upcoming")}
        >
          <img className="icon-img" src={upcomingIcon} alt="" aria-hidden />
          <span>Upcoming</span>
        </button>

        <button className="tab-btn" onClick={() => scrollToId("section-past")}>
          <img className="icon-img" src={pastIcon} alt="" aria-hidden />
          <span>Past</span>
        </button>

        <button className="tab-btn" onClick={() => scrollToId("section-plan")}>
          <img className="icon-img" src={planIcon} alt="" aria-hidden />
          <span>Plan</span>
        </button>
      </div>

      {/* ACTIVE */}
      <section id="section-active" className="trip-section">
        <SectionHeader
          icon={tripIcon}
          label={`Active trip (${activeTrips.length})`}
        />
        {activeTrips.length ? (
          activeTrips.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              onShare={openShare}
              onSaveChanges={updateTrip}
              onDeleteTrip={deleteTrip}
              onAddDoc={addDoc}
              onDeleteDoc={deleteDoc}
              onRenameDoc={renameDoc}
            />
          ))
        ) : (
          <div className="empty">No active trip</div>
        )}
      </section>

      {/* UPCOMING */}
      <section id="section-upcoming" className="trip-section">
        <SectionHeader
          icon={upcomingIcon}
          label={`Upcoming (${upcomingTrips.length})`}
        />
        {upcomingTrips.length ? (
          upcomingTrips.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              onShare={openShare}
              onSaveChanges={updateTrip}
              onDeleteTrip={deleteTrip}
              onAddDoc={addDoc}
              onDeleteDoc={deleteDoc}
              onRenameDoc={renameDoc}
            />
          ))
        ) : (
          <div className="empty">No upcoming trips</div>
        )}
      </section>

      {/* PAST */}
      <section id="section-past" className="trip-section">
        <SectionHeader
          icon={tripIcon}
          label={`Past trips (${pastTrips.length})`}
          right={
            pastTrips.length ? (
              <button
                className="tm-btn ghost"
                onClick={() => setPastCollapsed((v) => !v)}
              >
                {pastCollapsed ? "Expand" : "Collapse"}
              </button>
            ) : null
          }
        />
        {!pastTrips.length ? (
          <div className="empty">No past trips</div>
        ) : pastCollapsed ? null : (
          pastTrips.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              onShare={openShare}
              onSaveChanges={updateTrip}
              onDeleteTrip={deleteTrip}
              onAddDoc={addDoc}
              onDeleteDoc={deleteDoc}
              onRenameDoc={renameDoc}
            />
          ))
        )}
      </section>

      {/* PLAN A NEW TRIP */}
      <section id="section-plan" className="trip-section">
        <SectionHeader icon={planIcon} label="Plan a new trip" />
        <div className="plan-card">
          <form className="plan-grid" onSubmit={submitPlan}>
            <label className="field">
              <span>Title</span>
              <input
                type="text"
                placeholder="Trip title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>City</span>
              <input
                type="text"
                placeholder="City"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>Country</span>
              <input
                type="text"
                placeholder="Country"
                value={form.country}
                onChange={(e) =>
                  setForm((f) => ({ ...f, country: e.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>From</span>
              <input
                type="date"
                value={form.from}
                onChange={(e) =>
                  setForm((f) => ({ ...f, from: e.target.value }))
                }
              />
            </label>
            <label className="field">
              <span>To</span>
              <input
                type="date"
                value={form.to}
                onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
              />
            </label>

            <div className="plan-prefs">
              <div className="panel-title">
                <span>Preferences</span>
              </div>
              <ul className="pref-list">
                {[
                  "Nature",
                  "Concerts & Events",
                  "Gastronomy",
                  "Touristic places",
                ].map((p) => (
                  <li key={p}>
                    <label className="pref-check">
                      <input
                        type="checkbox"
                        checked={form.prefs.has(p)}
                        onChange={(e) => {
                          const next = new Set(form.prefs);
                          if (e.target.checked) next.add(p);
                          else next.delete(p);
                          setForm((f) => ({ ...f, prefs: next }));
                        }}
                      />
                      <span>{p}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="plan-actions">
              <button className="tm-btn" type="submit">
                <img className="icon-img" src={saveIcon} alt="" aria-hidden />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SHARE MODAL */}
      {shareOpen && (
        <div
          className="tm-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Share trip"
        >
          <div className="tm-modal-card">
            <div className="tm-modal-head">
              <h4>Share to feed</h4>
              <button
                className="icon-btn"
                onClick={closeShare}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="tm-modal-body">
              <label className="field">
                <span>Add a comment (optional)</span>
                <textarea
                  value={shareComment}
                  onChange={(e) => setShareComment(e.target.value)}
                  placeholder="Write something about this trip…"
                />
              </label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={shareIncludePrefs}
                  onChange={(e) => setShareIncludePrefs(e.target.checked)}
                />
                <span>Include Preferences in the post</span>
              </label>
            </div>
            <div className="tm-modal-foot">
              <button className="tm-btn ghost" onClick={closeShare}>
                Cancel
              </button>
              <button className="tm-btn" onClick={confirmShare}>
                <img className="icon-img" src={shareIcon} alt="" aria-hidden />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
