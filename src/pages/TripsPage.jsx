import { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "./Trips.css";

/**
 * TripPage
 * - Create and list trip plans
 * - Pick a date range (startDate/endDate)
 * - Set one active trip
 * - Mock API using localStorage (replace with your real API later)
 */

function loadTripsLS() {
  try {
    return JSON.parse(localStorage.getItem("trips") || "[]");
  } catch {
    return [];
  }
}
function saveTripsLS(trips) {
  localStorage.setItem("trips", JSON.stringify(trips));
}
function loadActiveTripIdLS() {
  return localStorage.getItem("activeTripId") || "";
}
function saveActiveTripIdLS(id) {
  if (id) localStorage.setItem("activeTripId", id);
  else localStorage.removeItem("activeTripId");
}

export default function TripPage() {
  // Form state
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [range, setRange] = useState({ from: undefined, to: undefined }); // DayPicker range

  // Data
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState("");

  // Load from localStorage (replace with real API on mount)
  useEffect(() => {
    setTrips(loadTripsLS());
    setActiveTripId(loadActiveTripIdLS());
  }, []);

  const activeTrip = useMemo(
    () => trips.find((t) => t.id === activeTripId),
    [trips, activeTripId]
  );

  function resetForm() {
    setTitle("");
    setCountry("");
    setCity("");
    setRange({ from: undefined, to: undefined });
  }

  function handleCreateTrip(e) {
    e.preventDefault();
    if (!title || !country || !city || !range?.from || !range?.to) {
      alert("Please fill title, country, city and select a date range.");
      return;
    }
    const newTrip = {
      id: String(Date.now()),
      title,
      country,
      city,
      startDate: range.from.toISOString(),
      endDate: range.to.toISOString(),
    };
    const next = [newTrip, ...trips];
    setTrips(next);
    saveTripsLS(next);
    resetForm();
  }

  function setActive(id) {
    setActiveTripId(id);
    saveActiveTripIdLS(id);
  }

  function removeTrip(id) {
    const next = trips.filter((t) => t.id !== id);
    setTrips(next);
    saveTripsLS(next);
    if (activeTripId === id) {
      setActiveTripId("");
      saveActiveTripIdLS("");
    }
  }

  return (
    <main className="tm-trip">
      <section className="tm-card">
        <h1 className="tm-title">Trips</h1>

        {/* Active trip summary */}
        <div className="tm-active">
          <h2>Active trip</h2>
          {activeTrip ? (
            <div className="tm-active__box">
              <strong>{activeTrip.title}</strong>
              <span>
                {activeTrip.city}, {activeTrip.country}
              </span>
              <span>
                {new Date(activeTrip.startDate).toLocaleDateString()} →{" "}
                {new Date(activeTrip.endDate).toLocaleDateString()}
              </span>
              <button
                className="tm-btn tm-btn--ghost"
                onClick={() => {
                  setActiveTripId("");
                  saveActiveTripIdLS("");
                }}
              >
                Clear active
              </button>
            </div>
          ) : (
            <p>No active trip selected.</p>
          )}
        </div>

        {/* Create trip */}
        <form className="tm-form" onSubmit={handleCreateTrip}>
          <h2>Create a new trip</h2>

          <label className="tm-field">
            <span>Title</span>
            <input
              type="text"
              placeholder="Barcelona getaway"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className="tm-row">
            <label className="tm-field">
              <span>Country</span>
              <input
                type="text"
                placeholder="Spain"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>

            <label className="tm-field">
              <span>City</span>
              <input
                type="text"
                placeholder="Barcelona"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
          </div>

          <div className="tm-field">
            <span>Dates (range)</span>
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              captionLayout="dropdown"
              fromYear={2024}
              toYear={2030}
            />
          </div>

          <div className="tm-actions">
            <button type="submit" className="tm-btn tm-btn--primary">
              Save trip
            </button>
          </div>
        </form>

        {/* Trips list */}
        <div className="tm-list">
          <h2>Your trips</h2>
          {trips.length === 0 ? (
            <p>No trips yet.</p>
          ) : (
            <ul className="tm-trips">
              {trips.map((t) => (
                <li key={t.id} className="tm-trip-item">
                  <div className="tm-trip-item__info">
                    <strong>{t.title}</strong>
                    <span>
                      {t.city}, {t.country}
                    </span>
                    <span>
                      {new Date(t.startDate).toLocaleDateString()} →{" "}
                      {new Date(t.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="tm-trip-item__actions">
                    <button
                      className={`tm-btn ${
                        activeTripId === t.id ? "tm-btn--current" : ""
                      }`}
                      onClick={() => setActive(t.id)}
                      aria-label="Set as active trip"
                    >
                      {activeTripId === t.id ? "Active" : "Set active"}
                    </button>
                    <button
                      className="tm-btn tm-btn--ghost"
                      onClick={() => removeTrip(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
