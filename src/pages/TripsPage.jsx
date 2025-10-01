// src/pages/TripsPage.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import "./Trips.css";
import axios from "axios";

/* --------- Icons --------- */
import tripIcon from "../assets/Iconos/trip.png";
import upcomingIcon from "../assets/Iconos/upcoming.png";
//import planIcon from "../assets/Iconos/plan.png";
import uploadIcon from "../assets/Iconos/upload.png";
import shareIcon from "../assets/Iconos/share.png";
import editIcon from "../assets/Iconos/edit.png";
import deleteIcon from "../assets/Iconos/delete.png";
import saveIcon from "../assets/Iconos/save.png";
import pastIcon from "../assets/Iconos/past.png";

/* ===================== Helpers ===================== */
function parseDateInput(x) {
  if (!x) return null;
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
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
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

/* ===================== TripCard ===================== */
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
    onSaveChanges(trip._id, {
      title: draft.title?.trim() || "Untitled trip",
      city: draft.city?.trim() || "",
      country: draft.country?.trim() || "",
      countryCode: draft.countryCode?.trim() || "",
      startDate: new Date(draft.startDate),
      endDate: new Date(draft.endDate || draft.startDate),
      preferences: draft.preferences || [],
    });
    setEditing(false);
  };
  const cancelEdit = () => {
    setDraft(trip);
    setEditing(false);
  };

  return (
    <div className="trip-card">
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
                      setDraft({ ...draft, startDate: e.target.value })
                    }
                  />
                  <span>→</span>
                  <input
                    type="date"
                    value={toISOInput(draft.endDate || draft.startDate)}
                    onChange={(e) =>
                      setDraft({ ...draft, endDate: e.target.value })
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
              <button className="tm-btn" onClick={() => onShare(trip)}>
                <img className="icon-img" src={shareIcon} alt="" aria-hidden />
                <span>Share</span>
              </button>
              <button className="tm-btn ghost" onClick={() => setEditing(true)}>
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

      {/* DETAILS */}
      <div className="preferences">
        <div className="panel-title">
          <img className="icon-img" src={editIcon} alt="" />
          <span>Preferences</span>
        </div>
        <ul className="pref-list">
          {[
            "nature",
            "concerts_and_events",
            "gastronomy",
            "touristic_places",
          ].map((p) => (
            <li key={p}>
              <label className="pref-check">
                <input
                  type="checkbox"
                  checked={draft.preferences?.includes(p) || false}
                  onChange={() => editing && togglePref(p)}
                  readOnly={!editing}
                />
                <span>{p.replace(/_/g, " ")}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ===================== TripsPage ===================== */
export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken"); // <- pega o token certo
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get("http://localhost:5005/api/trips", {
          headers: getAuthHeaders(),
        });
        setTrips(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const updateTrip = async (id, payload) => {
    try {
      const res = await axios.put(
        `http://localhost:5005/api/trips/${id}`,
        payload,
        { headers: getAuthHeaders() }
      );
      setTrips((prev) => prev.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error(err);
      alert("Failed to update trip");
    }
  };

  const deleteTrip = async (id) => {
    try {
      await axios.delete(`http://localhost:5005/api/trips/${id}`, {
        headers: getAuthHeaders(),
      });
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.log(err);
      alert("Failed to delete trip");
    }
  };

  const openShare = (trip) => {
    alert(`Sharing trip: ${trip.title}`);
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

  if (loading) {
    return (
      <main className="trip-page">
        <div className="tm-loading">Loading trips…</div>
      </main>
    );
  }

  return (
    <main className="trip-page">
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
              key={t._id}
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
              key={t._id}
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
          icon={pastIcon}
          label={<span>Past trips ({pastTrips.length})</span>}
        />
        {pastTrips.length ? (
          pastTrips.map((t) => (
            <TripCard
              key={t._id}
              trip={t}
              onShare={openShare}
              onSaveChanges={updateTrip}
              onDeleteTrip={deleteTrip}
            />
          ))
        ) : (
          <div className="empty">No past trips</div>
        )}
      </section>
    </main>
  );
}
