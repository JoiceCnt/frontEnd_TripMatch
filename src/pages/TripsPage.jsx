// src/pages/TripsPage.jsx
import { useState, useEffect, useMemo, useRef } from "react";
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

/* --------- External API --------- */
const CSC_API_URL = "https://api.countrystatecity.in/v1";
const CSC_API_KEY = "eDZSRUZZSlhUMGpkNm1GUXVwUXN5REIxSGF3YldESllpaXhuWUM4RA==";
const HEADERS = { "X-CSCAPI-KEY": CSC_API_KEY };

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

/* ===================== UI Components ===================== */
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

function TripCard({ trip, onShare }) {
  const [bgImage, setBgImage] = useState(null);
  const inputRef = useRef(null);

  const pickImage = () => inputRef.current?.click();
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setBgImage(url);
    e.target.value = "";
  };

  return (
    <div className="trip-card">
      <div
        className="trip-hero"
        style={{ backgroundImage: bgImage ? `url(${bgImage})` : "none" }}
      >
        {bgImage && <div className="trip-hero-scrim" aria-hidden />}
        <div className="trip-hero-left">
          <h3 className="trip-title">{trip.title}</h3>
          <div className="trip-meta">
            <span>
              {trip.city}, {trip.country}
            </span>
            <span className="dot" />
            <span>
              From {trip.startDate} to {trip.endDate}
            </span>
          </div>
        </div>
        <div className="trip-hero-right">
          <button className="tm-btn ghost" onClick={pickImage}>
            <img className="icon-img" src={uploadIcon} alt="" />
            <span>Upload image</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={onFileChange}
          />
          <button className="tm-btn" onClick={() => onShare(trip)}>
            <img className="icon-img" src={shareIcon} alt="" />
            <span>Share</span>
          </button>
        </div>
      </div>

      <div className="trip-details">
        <div className="activities">
          <div className="panel-title">
            <img className="icon-img" src={saveIcon} alt="" />
            <span>Activities</span>
          </div>
          <div className="activity-list">
            {trip.activities?.map((a, i) => (
              <div className="activity-item" key={i}>
                {a.title || a}
              </div>
            ))}
          </div>
        </div>
        <div className="preferences">
          <div className="panel-title">
            <img className="icon-img" src={editIcon} alt="" />
            <span>Preferences</span>
          </div>
          <ul className="pref-list">
            {trip.preferences?.map((p, i) => (
              <li key={i}>
                <label className="pref-check">
                  <input type="checkbox" defaultChecked />
                  <span>{p}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="trip-docs">
        <div className="doc-actions">
          <button className="chip">
            <img className="icon-img" src={downloadIcon} alt="" />
            <span>Outbound</span>
          </button>
          <button className="chip">
            <img className="icon-img" src={downloadIcon} alt="" />
            <span>Return</span>
          </button>
        </div>
        <div className="doc-list">
          {trip.documents?.map((d, i) => (
            <div className="doc-item" key={i}>
              <img className="icon-img" src={downloadIcon} alt="" />
              <span className="doc-name">{d.name || d}</span>
              <div className="doc-cta">
                <button className="icon-only">
                  <img className="icon-img" src={editIcon} alt="" />
                </button>
                <button className="icon-only">
                  <img className="icon-img" src={deleteIcon} alt="" />
                </button>
              </div>
            </div>
          ))}
          <button className="chip ghost">
            <img className="icon-img" src={addIcon} alt="" />
            <span>Add a new document</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Página ===================== */
export default function TripPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 const [newTrip, setNewTrip] = useState({
  title: "",
  city: "",
  country: "",
  countryCode: "",
  startDate: "",
  endDate: "",
  preferences: [],
  activities: [], 
  documents: [], 
});

  const [countryList, setCountryList] = useState([]);
  const [cityList, setCityList] = useState([]);

  const [shareOpen, setShareOpen] = useState(false);
  const [shareTrip, setShareTrip] = useState(null);
  const [shareComment, setShareComment] = useState("");
  const [shareIncludePrefs, setShareIncludePrefs] = useState(true);

  /* -------- Fetch trips from backend -------- */
  useEffect(() => {
    fetch("http://localhost:5005/api/trips")
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* -------- Fetch countries on mount -------- */
  useEffect(() => {
    fetch(`${CSC_API_URL}/countries`, { headers: HEADERS })
      .then((res) => res.json())
      .then((data) =>
        setCountryList(
          data.map((c) => ({ name: c.name, iso2: c.iso2 })).sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        )
      )
      .catch((err) => console.error("Error fetching countries", err));
  }, []);

  /* -------- Fetch cities when country changes -------- */
  useEffect(() => {
    if (!newTrip.countryCode) return setCityList([]);
    fetch(`${CSC_API_URL}/countries/${newTrip.countryCode}/cities`, { headers: HEADERS })
      .then((res) => res.json())
      .then((data) =>
        setCityList(data.map((c) => ({ name: c.name })))
      )
      .catch((err) => console.error("Error fetching cities", err));
  }, [newTrip.countryCode]);

  /* -------- Handlers -------- */
  const handleChange = (e) => {
  const { name, value } = e.target;
  setNewTrip((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrefChange = (e) => {
    const value = e.target.value;
    setNewTrip((prev) =>
      prev.preferences.includes(value)
        ? { ...prev, preferences: prev.preferences.filter((p) => p !== value) }
        : { ...prev, preferences: [...prev.preferences, value] }
    );
  };

  /* -------------------- Activities dinámicas -------------------- */
const addActivity = () => {
  setNewTrip((prev) => ({
    ...prev,
    activities: [...prev.activities, { title: "", when: "", location: "", notes: "" }],
  }));
};

const handleActivityChange = (index, field, value) => {
  setNewTrip((prev) => {
    const activities = [...prev.activities];
    activities[index][field] = value;
    return { ...prev, activities };
  });
};

/* -------------------- Documents dinámicos -------------------- */
const addDocument = () => {
  setNewTrip((prev) => ({
    ...prev,
    documents: [...prev.documents, { name: "", url: "", mimeType: "", tag: "other", sizeBytes: 0 }],
  }));
};

const handleDocumentChange = (index, field, value) => {
  setNewTrip((prev) => {
    const documents = [...prev.documents];
    documents[index][field] = value;
    return { ...prev, documents };
  });
};

/* -------------------- Submit -------------------- */
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5005/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTrip), // <--- usar newTrip, no tripData
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text || "Invalid JSON response from server" };
    }

    if (!res.ok) {
      console.error("❌ Error creating trip:", data);
      setError(data.error || "Error creating trip");
      return;
    }

    console.log("✅ Trip created:", data);
    setTrips((prev) => [...prev, data]); // añadir a lista de trips
    setNewTrip({ title: "", city: "", country: "", countryCode: "", startDate: "", endDate: "", preferences: [], activities: [], documents: [] }); // reset
    setError(null);
  } catch (err) {
    console.error("❌ Network or fetch error:", err);
    setError("Network error or server not reachable");
  }
};

  const openShare = (trip) => {
    setShareTrip(trip);
    setShareOpen(true);
  };
  const closeShare = () => setShareOpen(false);
  const confirmShare = () => {
    console.log("SHARE ▶", { trip: shareTrip, comment: shareComment });
    setShareComment("");
    setShareIncludePrefs(true);
    setShareOpen(false);
  };

  const activeTrips = useMemo(() => trips.filter((t) => getTripStatus(t) === "active"), [trips]);
  const upcomingTrips = useMemo(() => trips.filter((t) => getTripStatus(t) === "upcoming"), [trips]);
  const pastTrips = useMemo(() => trips.filter((t) => getTripStatus(t) === "past"), [trips]);

  return (
    <main className="trip-page">
      <div className="section-nav">
        <button onClick={() => document.getElementById("section-active")?.scrollIntoView()}>
          <img className="icon-img" src={tripIcon} alt="" />
          <span>Active trip</span>
        </button>
        <button onClick={() => document.getElementById("section-upcoming")?.scrollIntoView()}>
          <img className="icon-img" src={upcomingIcon} alt="" />
          <span>Upcoming</span>
        </button>
        <button onClick={() => document.getElementById("section-past")?.scrollIntoView()}>
          <img className="icon-img" src={pastIcon} alt="" />
          <span>Past</span>
        </button>
        <button onClick={() => document.getElementById("section-plan")?.scrollIntoView()}>
          <img className="icon-img" src={planIcon} alt="" />
          <span>Plan</span>
        </button>
      </div>

      {/* Active */}
      <section id="section-active" className="trip-section">
        <SectionHeader icon={tripIcon} label={`Active trip (${activeTrips.length})`} />
        {loading ? <p>Loading trips…</p> :
          activeTrips.length ? activeTrips.map((t) => <TripCard key={t._id} trip={t} onShare={openShare} />) : <p>No active trip</p>}
      </section>

      {/* Upcoming */}
      <section id="section-upcoming" className="trip-section">
        <SectionHeader icon={upcomingIcon} label={`Upcoming (${upcomingTrips.length})`} />
        {upcomingTrips.length ? upcomingTrips.map((t) => <TripCard key={t._id} trip={t} onShare={openShare} />) : <p>No upcoming trips</p>}
      </section>

      {/* Past */}
      <section id="section-past" className="trip-section">
        <SectionHeader icon={pastIcon} label={`Past trips (${pastTrips.length})`} />
        {pastTrips.length ? pastTrips.map((t) => <TripCard key={t._id} trip={t} onShare={openShare} />) : <p>No past trips</p>}
      </section>

      {/* Plan a new trip */}
      <section id="section-plan" className="trip-section">
  <SectionHeader icon={planIcon} label="Plan a new trip" />
  <div className="plan-card">
    <form className="plan-grid" onSubmit={handleSubmit}>

      {/* Title */}
      <label className="field">
        <span>Title</span>
        <input
          type="text"
          name="title"
          value={newTrip.title}
          onChange={handleChange}
          required
        />
      </label>

      {/* Country */}
      <label className="field">
        <span>Country</span>
        <select
          name="countryCode"
          value={newTrip.countryCode}
          onChange={(e) => {
            const selected = countryList.find(
              (c) => c.iso2 === e.target.value || c.name === e.target.value
            );
            if (selected)
              setNewTrip((prev) => ({
                ...prev,
                country: selected.name,
                countryCode: selected.iso2,
                city: "",
              }));
          }}
          required
        >
          <option value="">Select country</option>
          {countryList.map((c) => (
            <option key={c.iso2} value={c.iso2}>{c.name}</option>
          ))}
        </select>
      </label>

      {/* City */}
      <label className="field">
        <span>City</span>
        <input
          list="city-list"
          name="city"
          value={newTrip.city}
          onChange={handleChange}
          required
        />
        <datalist id="city-list">
          {cityList.map((c, i) => <option key={i} value={c.name} />)}
        </datalist>
      </label>

      {/* Start Date */}
      <label className="field">
        <span>From</span>
        <input
          type="date"
          name="startDate"
          value={newTrip.startDate}
          onChange={handleChange}
          required
        />
      </label>

      {/* End Date */}
      <label className="field">
        <span>To</span>
        <input
          type="date"
          name="endDate"
          value={newTrip.endDate}
          onChange={handleChange}
          required
        />
      </label>

      {/* Preferences */}
      <div className="plan-prefs">
        <span>Preferences</span>
        <ul className="pref-list">
          {[
            { label: "Nature", value: "nature" },
            { label: "Concerts & Events", value: "concerts_and_events" },
            { label: "Gastronomy", value: "gastronomy" },
            { label: "Touristic places", value: "touristic_places" },
          ].map((p) => (
            <li key={p.value}>
              <label className="pref-check">
                <input
                  type="checkbox"
                  value={p.value}
                  checked={newTrip.preferences.includes(p.value)}
                  onChange={handlePrefChange}
                />
                <span>{p.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Activities dinámicas */}
      <div className="plan-activities">
        <span>Activities</span>
        {newTrip.activities.map((a, i) => (
          <div className="activity-item" key={i}>
            <input
              type="text"
              placeholder="Title"
              value={a.title}
              onChange={(e) => handleActivityChange(i, "title", e.target.value)}
            />
            <input
              type="date"
              value={a.when}
              onChange={(e) => handleActivityChange(i, "when", e.target.value)}
            />
            <input
              type="text"
              placeholder="Location"
              value={a.location}
              onChange={(e) => handleActivityChange(i, "location", e.target.value)}
            />
            <input
              type="text"
              placeholder="Notes"
              value={a.notes}
              onChange={(e) => handleActivityChange(i, "notes", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="tm-btn ghost" onClick={addActivity}>
          <img className="icon-img" src={addIcon} alt="" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Documents dinámicos */}
      <div className="plan-documents">
        <span>Documents</span>
        {newTrip.documents.map((d, i) => (
          <div className="document-item" key={i}>
            <input
              type="text"
              placeholder="Name"
              value={d.name}
              onChange={(e) => handleDocumentChange(i, "name", e.target.value)}
            />
            <input
              type="text"
              placeholder="URL"
              value={d.url}
              onChange={(e) => handleDocumentChange(i, "url", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="tm-btn ghost" onClick={addDocument}>
          <img className="icon-img" src={addIcon} alt="" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Actions */}
      <div className="plan-actions">
        {error && <p className="error-message" style={{ color: "red" }}>{error}</p>}
        <button className="tm-btn" type="submit">
          <img className="icon-img" src={saveIcon} alt="" />
          <span>Save</span>
        </button>
      </div>

    </form>
  </div>
</section>




      {shareOpen && (
        <div className="tm-modal">
          <div className="tm-modal-card">
            <div className="tm-modal-head">
              <h4>Share to feed</h4>
              <button onClick={closeShare}>X</button>
            </div>
            <div className="tm-modal-body">
              <textarea placeholder="Add a comment…" value={shareComment} onChange={(e) => setShareComment(e.target.value)} />
              <label>
                <input type="checkbox" checked={shareIncludePrefs} onChange={(e) => setShareIncludePrefs(e.target.checked)} />
                Include preferences
              </label>
            </div>
            <div className="tm-modal-footer">
              <button className="tm-btn" onClick={confirmShare}>Share</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
