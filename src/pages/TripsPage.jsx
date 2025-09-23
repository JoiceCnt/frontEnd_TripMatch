import { useRef, useState, useEffect } from "react";
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

/* Header pequeno com ícone */
function SectionHeader({ icon, label }) {
  return (
    <div className="trip-section-header">
      <img className="icon-img" src={icon} alt="" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export default function TripPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Llamada a API al montar ---
  useEffect(() => {
    fetch("http://localhost:5005/api/trips")
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching trips");
        return res.json();
      })
      .then((data) => {
        setTrips(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error cargando viajes:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  /* ---------- Smooth scroll ---------- */
  const scrollToId = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ------- Estados de UI compartilhados ------- */
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState({ section: "", trip: null });
  const [shareComment, setShareComment] = useState("");
  const [shareIncludePrefs, setShareIncludePrefs] = useState(true);

  /* Imagens de fundo por sessão */
  const [bgActive, setBgActive] = useState(null);
  const [bgUpcoming, setBgUpcoming] = useState(null);

  const inputActiveRef = useRef(null);
  const inputUpcomingRef = useRef(null);

  const pickActive = () => inputActiveRef.current?.click();
  const pickUpcoming = () => inputUpcomingRef.current?.click();

  const onFilePicked = (e, setter) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setter(url);
  };

  /* ------- Dados mock ------- */
  const activeTrip = {
    title: "Barcelona Getaway",
    city: "Barcelona",
    country: "Spain",
    startDate: "19/09/2025",
    endDate: "22/09/2025",
    preferences: [
      "Nature",
      "Concerts & Events",
      "Gastronomy",
      "Touristic places",
    ],
    activities: [
      "19/09/2025 15:00 Sagrada Família",
      "20/09/2025 12:00 Park Güell",
      "20/09/2025 18:00 La Boqueria",
      "20/09/2025 16:00 Casa Batlló",
    ],
    documents: [
      "Sagrada Familia tickets.pdf",
      "Park Güell tickets.pdf",
      "Casa Batlló tickets.pdf",
    ],
  };

  const upcomingTrip = {
    title: "Beautiful Rome",
    city: "Rome",
    country: "Italy",
    startDate: "22/10/2025",
    endDate: "28/10/2025",
    preferences: [
      "Nature",
      "Concerts & Events",
      "Gastronomy",
      "Touristic places",
    ],
    activities: [
      "22/10/2025 15:00 Flight",
      "23/10/2025 10:30 Colosseum",
      "28/10/2025 16:00 Flight return",
    ],
    documents: ["Colosseum tickets.pdf"],
  };

  /* ------- Share ------- */
  const openShare = (section, trip) => {
    setSharePayload({ section, trip });
    setShareOpen(true);
  };
  const closeShare = () => setShareOpen(false);
  const confirmShare = () => {
    console.log("SHARE ▶", {
      section: sharePayload.section,
      trip: sharePayload.trip,
      comment: shareComment.trim(),
      includePreferences: shareIncludePrefs,
    });
    setShareComment("");
    setShareIncludePrefs(true);
    setShareOpen(false);
  };

  /* ------- UI utilitário ------- */
  const TripCard = ({ trip, bgImage, onPickImage, inputRef, onFileChange }) => {
    return (
      <div className="trip-card">
        {/* HERO / topo com imagem de fundo */}
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
            <button
              className="tm-btn ghost"
              onClick={onPickImage}
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
            <button
              className="tm-btn"
              onClick={() => openShare("trip", trip)}
              title="Share to feed"
            >
              <img className="icon-img" src={shareIcon} alt="" aria-hidden />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Detalhes (colunas) */}
        <div className="trip-details">
          <div className="activities">
            <div className="panel-title">
              <img className="icon-img" src={saveIcon} alt="" aria-hidden />
              <span>Activities</span>
            </div>
            <div className="activity-list">
              {trip.activities.map((a, i) => (
                <div className="activity-item" key={i}>
                  {a}
                </div>
              ))}
            </div>
          </div>

          <div className="preferences">
            <div className="panel-title">
              <img className="icon-img" src={editIcon} alt="" aria-hidden />
              <span>Preferences</span>
            </div>
            <ul className="pref-list">
              {trip.preferences.map((p, i) => (
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

        {/* Documentos */}
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
            {trip.documents.map((d, i) => (
              <div className="doc-item" key={i}>
                <img
                  className="icon-img"
                  src={downloadIcon}
                  alt=""
                  aria-hidden
                />
                <span className="doc-name">{d}</span>
                <div className="doc-cta">
                  <button className="icon-only" title="Edit">
                    <img className="icon-img" src={editIcon} alt="" />
                  </button>
                  <button className="icon-only" title="Delete">
                    <img className="icon-img" src={deleteIcon} alt="" />
                  </button>
                </div>
              </div>
            ))}
            <button className="chip ghost">
              <img className="icon-img" src={addIcon} alt="" aria-hidden />
              <span>Add a new document</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

 return (
  <main className="trip-page">
    {/* --------- TOP TABS --------- */}
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
      <button
        className="tab-btn"
        onClick={() => scrollToId("section-plan")}
      >
        <img className="icon-img" src={planIcon} alt="" aria-hidden />
        <span>Plan</span>
      </button>
    </div>

    {/* ------------ ACTIVE TRIP ------------ */}
    <section id="section-active" className="trip-section">
      <SectionHeader icon={tripIcon} label="Active trip" />
      <TripCard
        trip={activeTrip}
        bgImage={bgActive}
        onPickImage={pickActive}
        inputRef={inputActiveRef}
        onFileChange={(e) => onFilePicked(e, setBgActive)}
      />
    </section>

    {/* ------------ UPCOMING ------------ */}
    <section id="section-upcoming" className="trip-section">
      <SectionHeader icon={upcomingIcon} label="Upcoming" />
      <TripCard
        trip={upcomingTrip}
        bgImage={bgUpcoming}
        onPickImage={pickUpcoming}
        inputRef={inputUpcomingRef}
        onFileChange={(e) => onFilePicked(e, setBgUpcoming)}
      />
    </section>

    {/* ------------ PLAN A NEW TRIP ------------ */}
    <section id="section-plan" className="trip-section">
      <SectionHeader icon={planIcon} label="Plan a new trip" />
      <div className="plan-card">
        <form className="plan-grid" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span>Title</span>
            <input type="text" placeholder="Trip title" />
          </label>
          <label className="field">
            <span>City</span>
            <input type="text" placeholder="City" />
          </label>
          <label className="field">
            <span>Country</span>
            <input type="text" placeholder="Country" />
          </label>
          <label className="field">
            <span>From</span>
            <input type="date" />
          </label>
          <label className="field">
            <span>To</span>
            <input type="date" />
          </label>

          <div className="plan-prefs">
            <div className="panel-title">
              <span>Preferences</span>
            </div>
            <ul className="pref-list">
              {["Nature", "Concerts & Events", "Gastronomy", "Touristic places"].map(
                (p) => (
                  <li key={p}>
                    <label className="pref-check">
                      <input type="checkbox" />
                      <span>{p}</span>
                    </label>
                  </li>
                )
              )}
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

    {/* ------------ MODAL SHARE ------------ */}
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

    {/* Loader o error */}
    {loading && <p>Loading trips...</p>}
    {error && <p style={{ color: "red" }}>{error}</p>}

    {/* Render dinámico de viajes desde backend */}
    {trips.map((trip) => (
      <section key={trip._id} className="trip-section">
        <h3>{trip.title}</h3>
        <p>
          {trip.city}, {trip.country}
        </p>
        <p>
          From {trip.startDate} to {trip.endDate}
        </p>
        {/* Aquí podrías usar <TripCard trip={trip} /> también */}
      </section>
    ))}
  </main>
);
}