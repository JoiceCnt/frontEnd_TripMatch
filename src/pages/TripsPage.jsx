import { useState, useEffect, useMemo, useRef } from "react";
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

/* ===================== Upload Helper ===================== */
const uploadImageToServer = async (file) => {
  const formData = new FormData();
  formData.append("imageUrl", file); // precisa bater com o multer.single("imageUrl")

  try {
    const res = await axios.post("http://localhost:5005/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.imageUrl;
  } catch (err) {
    console.error("Erro ao subir imagem:", err);
    return null;
  }
};

/* ===================== TripCard ===================== */
function TripCard({ trip, onShare, onSaveChanges, onDeleteTrip }) {
  const [bgImage, setBgImage] = useState(trip.imageUrl || null);
  const inputRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(trip);
  useEffect(() => setDraft(trip), [trip]);

  const pickImage = () => inputRef.current?.click();

  const onFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const url = await uploadImageToServer(f);

    if (url) {
      setBgImage(url);
      onSaveChanges(trip.id, { ...trip, imageUrl: url });
    }

    e.target.value = "";
  };

  return (
    <div className="trip-card">
      {/* HEADER COM BACKGROUND */}
      <div
        className="trip-card-header"
        style={{
          backgroundImage:
            bgImage || trip.imageUrl
              ? `url(${bgImage || trip.imageUrl})`
              : "none",
        }}
      >
        <div className="trip-card-overlay" />

        {/* LEFT: infos da viagem */}
        <div className="trip-card-info">
          {editing ? (
            <input
              className="trip-title-input"
              value={draft.title || ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Trip title"
            />
          ) : (
            <h3 className="trip-title">{trip.title}</h3>
          )}
          <div className="trip-meta">
            <span>
              {trip.city}, {trip.country}
            </span>
            <span className="dot" />
            <span>
              From {toISOInput(trip.startDate)} to {toISOInput(trip.endDate)}
            </span>
          </div>
        </div>

        {/* RIGHT: botões */}
        <div className="trip-card-actions">
          <button className="tm-btn ghost" onClick={pickImage}>
            <img className="icon-img" src={uploadIcon} alt="" />
          </button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept="image/*"
            onChange={onFileChange}
          />

          <button
            className="tm-btn ghost"
            onClick={() => setEditing((v) => !v)}
          >
            <img className="icon-img" src={editIcon} alt="" />
          </button>

          <button className="tm-btn ghost" onClick={() => onShare(trip)}>
            <img className="icon-img" src={shareIcon} alt="" />
          </button>

          <button
            className="tm-btn ghost"
            onClick={() => onDeleteTrip(trip.id)}
          >
            <img className="icon-img" src={deleteIcon} alt="" />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="trip-card-body">
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
                    onChange={() =>
                      editing &&
                      setDraft({
                        ...draft,
                        preferences: draft.preferences?.includes(p)
                          ? draft.preferences.filter((x) => x !== p)
                          : [...(draft.preferences || []), p],
                      })
                    }
                    readOnly={!editing}
                  />
                  <span>{p.replace(/_/g, " ")}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ===================== TripPage ===================== */
export default function TripPage({ user = { id: "me" } }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const openShare = (trip) => {
    alert(`Sharing trip: ${trip.title}`);
  };

  // New trip form
  const [newTrip, setNewTrip] = useState({
    country: "",
    countryCode: "",
    city: "",
    startDate: "",
    endDate: "",
  });
  const [form, setForm] = useState({
    title: "",
    prefs: new Set(),
  });

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [pastCollapsed, setPastCollapsed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTrip((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Fetch trips ---------------- */
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await axios.get("http://localhost:5005/api/trips", {
          headers: getAuthHeaders(),
        });
        setTrips(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  /* ---------------- Fetch countries ---------------- */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(`${CSC_API_URL}/countries`, {
          headers: HEADERS,
        });
        setCountries(res.data);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, []);

  /* ---------------- Fetch cities ---------------- */
  useEffect(() => {
    if (!newTrip.country) return;
    const fetchCities = async () => {
      try {
        const res = await axios.get(
          `${CSC_API_URL}/countries/${newTrip.countryCode}/cities`,
          { headers: HEADERS }
        );
        setCities(res.data);
      } catch (err) {
        console.error("Failed to fetch cities", err);
      }
    };
    fetchCities();
  }, [newTrip.country, newTrip.countryCode]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /* ---------------- CRUD handlers ---------------- */
  const updateTrip = async (id, payload) => {
    try {
      const res = await axios.put(
        `http://localhost:5005/api/trips/${id}`,
        payload,
        { headers: getAuthHeaders() }
      );
      setTrips((prev) => prev.map((t) => (t.id === id ? res.data : t)));
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
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete trip");
    }
  };

  const addTrip = async (payload) => {
    try {
      const res = await axios.post("http://localhost:5005/api/trips", payload, {
        headers: getAuthHeaders(),
      });
      setTrips((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Failed to create trip");
    }
  };

  /* ---------------- Submit new trip ---------------- */
  const submitPlan = async (e) => {
    e.preventDefault();

    if (
      !newTrip.country ||
      !newTrip.city ||
      !newTrip.startDate ||
      !newTrip.endDate ||
      !newTrip.countryCode
    )
      return alert("Please select a valid country and city");

    const payload = {
      title: form.title?.trim() || "Untitled trip",
      city: newTrip.city,
      country: newTrip.country,
      countryCode: newTrip.countryCode,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      preferences: Array.from(form.prefs)
        .map((p) => {
          switch (p) {
            case "Nature":
              return "nature";
            case "Concerts & Events":
              return "concerts_and_events";
            case "Gastronomy":
              return "gastronomy";
            case "Touristic places":
              return "touristic_places";
            default:
              return null;
          }
        })
        .filter(Boolean),
      createdBy: user.id,
    };

    await addTrip(payload);

    setNewTrip({
      country: "",
      countryCode: "",
      city: "",
      startDate: "",
      endDate: "",
    });
    setForm({ title: "", prefs: new Set() });
    setCities([]);
  };

  /* ---------------- Filter trips ---------------- */
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

  const [countryInput, setCountryInput] = useState("");
  const [cityInput, setCityInput] = useState("");

  if (loading)
    return (
      <main className="trip-page">
        <div className="tm-loading">Loading trips…</div>
      </main>
    );

  const handleCountryInput = (val) => {
    const found = countries.find(
      (c) => c.name.toLowerCase() === val.toLowerCase()
    );
    if (!found) {
      setNewTrip({ ...newTrip, countryCode: "", country: "", city: "" });
      setCities([]);
      setCountryInput("");
      setCityInput("");
      return false;
    }
    setNewTrip({
      ...newTrip,
      countryCode: found.iso2,
      country: found.name,
      city: "",
    });
    setCities([]);
    setCountryInput(found.name);
    setCityInput("");
    return true;
  };

  const handleCityInput = (val) => {
    const found = cities.find(
      (c) => c.name.toLowerCase() === val.toLowerCase()
    );
    if (!found) {
      setNewTrip((prev) => ({ ...prev, city: "" }));
      setCityInput("");
      return false;
    }
    setNewTrip((prev) => ({ ...prev, city: found.name }));
    setCityInput(found.name);
    return true;
  };

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
            {/* Title */}
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

            {/* Country */}
            <label className="field">
              <span>Country</span>
              <input
                list="country-list"
                value={countryInput || ""}
                onChange={(e) => setCountryInput(e.target.value)}
                onBlur={(e) => handleCountryInput(e.target.value)}
                required
              />
              <datalist id="country-list">
                {countries.map((c) => (
                  <option key={c.iso2} value={c.name} />
                ))}
              </datalist>
            </label>

            {/* City */}
            <label className="field">
              <span>City</span>
              <input
                list="city-list"
                value={cityInput || ""}
                onChange={(e) => setCityInput(e.target.value)}
                onBlur={(e) => handleCityInput(e.target.value)}
                disabled={!cities.length}
                required
              />
              <datalist id="city-list">
                {cities.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </label>

            {/* Dates */}
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

            {/* Submit */}
            <div className="plan-actions">
              <button className="tm-btn" type="submit">
                <img className="icon-img" src={saveIcon} alt="" aria-hidden />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
