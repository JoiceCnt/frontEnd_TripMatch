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

/* ===================== Datas & status ===================== */
// Aceita "DD/MM/YYYY" ou "YYYY-MM-DD"
function parseDateInput(x) {
  if (x instanceof Date) return x;
  if (typeof x === "string") {
    // ISO date-only
    if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return new Date(`${x}T00:00:00`);
    // DD/MM/YYYY
    const m = x.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  }
  return new Date(x);
}

// Normaliza para "data local, sem hora"
const dateOnly = (x) => {
  const d = parseDateInput(x);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

// Status: upcoming / active / past
function getTripStatus(trip) {
  const s = dateOnly(trip.startDate);
  const e = dateOnly(trip.endDate || trip.startDate); // 1 dia se não tiver end
  const today = dateOnly(new Date());

  if (today < s) return "upcoming";
  if (today > e) return "past";
  return "active"; // hoje ∈ [start, end]
}

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

/* Card com estado interno para imagem de capa */
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
      {/* HERO / topo com imagem */}
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
          <button
            className="tm-btn"
            onClick={() => onShare(trip)}
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
            {trip.activities?.map((a, i) => (
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
          {trip.documents?.map((d, i) => (
            <div className="doc-item" key={i}>
              <img className="icon-img" src={downloadIcon} alt="" aria-hidden />
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
}

/* ===================== Página ===================== */
export default function TripPage() {
  /* ---------- Smooth scroll ---------- */
  const scrollToId = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* ------- Modal de Share ------- */
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
    console.log("SHARE ▶", {
      trip: shareTrip,
      comment: shareComment.trim(),
      includePreferences: shareIncludePrefs,
    });
    setShareComment("");
    setShareIncludePrefs(true);
    setShareOpen(false);
  };

  /* ------- Dados mock: use seu fetch depois ------- */
  const [trips] = useState([
    {
      id: "t1",
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
    },
    {
      id: "t2",
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
    },
    {
      id: "t3",
      title: "Lisbon Weekend",
      city: "Lisbon",
      country: "Portugal",
      startDate: "10/04/2025",
      endDate: "12/04/2025",
      preferences: ["Gastronomy", "Touristic places"],
      activities: [
        "11/04/2025 11:00 Tram 28",
        "11/04/2025 18:00 Time Out Market",
      ],
      documents: [],
    },
  ]);

  /* ------- Partições por status ------- */
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

  /* ------- Past colapsado (opcional) ------- */
  const [pastCollapsed, setPastCollapsed] = useState(false);

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

        <button className="tab-btn" onClick={() => scrollToId("section-past")}>
          <img className="icon-img" src={pastIcon} alt="" aria-hidden />
          <span>Past</span>
        </button>

        <button className="tab-btn" onClick={() => scrollToId("section-plan")}>
          <img className="icon-img" src={planIcon} alt="" aria-hidden />
          <span>Plan</span>
        </button>
      </div>

      {/* ------------ ACTIVE TRIP ------------ */}
      <section id="section-active" className="trip-section">
        <SectionHeader
          icon={tripIcon}
          label={`Active trip (${activeTrips.length})`}
        />
        {activeTrips.length ? (
          activeTrips.map((t) => (
            <TripCard key={t.id} trip={t} onShare={openShare} />
          ))
        ) : (
          <div className="empty">No active trip</div>
        )}
      </section>

      {/* ------------ UPCOMING ------------ */}
      <section id="section-upcoming" className="trip-section">
        <SectionHeader
          icon={upcomingIcon}
          label={`Upcoming (${upcomingTrips.length})`}
        />
        {upcomingTrips.length ? (
          upcomingTrips.map((t) => (
            <TripCard key={t.id} trip={t} onShare={openShare} />
          ))
        ) : (
          <div className="empty">No upcoming trips</div>
        )}
      </section>

      {/* ------------ PAST TRIPS ------------ */}
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
            <TripCard key={t.id} trip={t} onShare={openShare} />
          ))
        )}
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
                {[
                  "Nature",
                  "Concerts & Events",
                  "Gastronomy",
                  "Touristic places",
                ].map((p) => (
                  <li key={p}>
                    <label className="pref-check">
                      <input type="checkbox" />
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
    </main>
  );
}
