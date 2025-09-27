// src/pages/TripPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./Trips.css";
import axios from "axios";

/* --------- Icons --------- */
import tripIcon from "../assets/Iconos/trip.png";
import upcomingIcon from "../assets/Iconos/upcoming.png";
import planIcon from "../assets/Iconos/plan.png";
import uploadIcon from "../assets/Iconos/upload.png";
import shareIcon from "../assets/Iconos/share.png";
import editIcon from "../assets/Iconos/edit.png";
import deleteIcon from "../assets/Iconos/delete.png";
import saveIcon from "../assets/Iconos/save.png";
import pastIcon from "../assets/Iconos/past.png";

/* ===================== Date utils ===================== */
function parseDateInput(x) {
  if (x instanceof Date) return x;
  if (typeof x === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return new Date(`${x}T00:00:00`);
    const m = x.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  }
  return new Date(x);
}
const dateOnly = (x) => {
  const d = parseDateInput(x);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};
function getTripStatus(trip) {
  const s = dateOnly(trip.startDate);
  const e = dateOnly(trip.endDate || trip.startDate);
  const today = dateOnly(new Date());
  if (today < s) return "upcoming";
  if (today > e) return "past";
  return "active";
}
const toISOInput = (d) => {
  const x = parseDateInput(d);
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${x.getFullYear()}-${mm}-${dd}`;
};
const fromDateInput = (value) => value;

/* ===================== UI helpers ===================== */
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

/* ============= TripCard (sem documentos) ============= */
function TripCard({ trip, onShare, onSaveChanges, onDeleteTrip }) {
  const [bgImage, setBgImage] = useState(null);
  const inputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(trip);
  useEffect(() => setDraft(trip), [trip]);

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
    onSaveChanges(trip.id, {
      title: draft.title?.trim() || "Untitled trip",
      city: draft.city?.trim() || "",
      country: draft.country?.trim() || "",
      startDate: draft.startDate,
      endDate: draft.endDate || draft.startDate,
      preferences: draft.preferences || [],
      activities: draft.activities || [],
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
          <button className="tm-btn ghost" onClick={pickImage} title="Upload">
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

      {/* DETAILS */}
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
                  {a.title}
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
              "nature",
              "concerts & Events",
              "gastronomy",
              "touristic places",
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
    </div>
  );
}

/* ===================== Page ===================== */
export default function TripPage({ user = { id: "me" } }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* Share modal */
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTrip, setShareTrip] = useState(null);
  const [shareComment, setShareComment] = useState("");
  const [shareIncludePrefs, setShareIncludePrefs] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5005/api/trips")
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateTrip = (id, payload) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...payload } : t))
    );
    // TODO: PATCH /api/trips/:id
  };

  const deleteTrip = (id) => {
    const ok = confirm("Delete this trip?");
    if (!ok) return;
    setTrips((prev) => prev.filter((t) => t.id !== id));
    // TODO: DELETE /api/trips/:id
  };

  const addTrip = async (payload) => {
    try {
      const response = await axios.post(
        "http://localhost:5005/api/trips",
        payload
      );
      setTrips((prev) => [response.data, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Failed to create trip");
    }
  };

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

  /* Form de novo plano (simples; sem documentos) */
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
      createdBy: user.id,
    };
    addTrip(payload);
    setForm({
      title: "",
      city: "",
      country: "",
      from: "",
      to: "",
      prefs: new Set(),
    });
  };

  const openShare = (trip) => {
    setShareTrip(trip);
    setShareOpen(true);
  };
  const closeShare = () => setShareOpen(false);
  const confirmShare = () => {
    console.log("SHARE ▶", {
      trip: shareTrip,
      comment: shareComment.trim(),
      includePreferences: shareIncludePrefs,
    });
    setShareComment("");
    setShareIncludePrefs(true);
    setShareOpen(false);
  };
  if (loading) {
    return (
      <main className="trip-page">
        <div className="tm-loading">Loading trips…</div>
      </main>
    );
  }

  return (
    <main className="trip-page">
      {/* TOP TABS */}
      <div className="section-nav">
        <button
          onClick={() =>
            document.getElementById("section-active")?.scrollIntoView()
          }
        >
          <img className="icon-img" src={tripIcon} alt="" />
          <span>Active trip</span>
        </button>
        <button
          onClick={() =>
            document.getElementById("section-upcoming")?.scrollIntoView()
          }
        >
          <img className="icon-img" src={upcomingIcon} alt="" />
          <span>Upcoming</span>
        </button>
        <button
          onClick={() =>
            document.getElementById("section-past")?.scrollIntoView()
          }
        >
          <img className="icon-img" src={pastIcon} alt="" />
          <span>Past</span>
        </button>
        <button
          onClick={() =>
            document.getElementById("section-plan")?.scrollIntoView()
          }
        >
          {error && (
            <div className="tm-alert error">Failed to load trips: {error}</div>
          )}
          <img className="icon-img" src={planIcon} alt="" />
          <span>Plan</span>
        </button>
      </div>

      {/* ACTIVE */}
      <section id="section-active" className="trip-section">
        <SectionHeader
          icon={tripIcon}
          label={<span>Active trip ({activeTrips.length})</span>}
        />
        {activeTrips.length ? (
          activeTrips.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              onShare={openShare}
              onSaveChanges={updateTrip}
              onDeleteTrip={deleteTrip}
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
          label={<span>Upcoming ({upcomingTrips.length})</span>}
        />
        {upcomingTrips.length ? (
          upcomingTrips.map((t) => (
            <TripCard
              key={t.id}
              trip={t}
              onShare={openShare}
              onSaveChanges={updateTrip}
              onDeleteTrip={deleteTrip}
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
          label={<span>Past trips ({pastTrips.length})</span>}
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
              <button onClick={closeShare}>X</button>
            </div>
            <div className="tm-modal-body">
              <textarea
                placeholder="Add a comment…"
                value={shareComment}
                onChange={(e) => setShareComment(e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={shareIncludePrefs}
                  onChange={(e) => setShareIncludePrefs(e.target.checked)}
                />
                Include preferences
              </label>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn" onClick={confirmShare}>
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
