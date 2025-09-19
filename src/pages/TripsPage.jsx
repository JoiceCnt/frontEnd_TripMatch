// src/pages/TripPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import "./Trips.css";

/** ====== CONFIG ====== */
const USE_API = false; // true quando seu backend estiver ligado
const API = import.meta?.env?.VITE_API_URL || "http://localhost:4000/api";

const USE_PLACES_API = false; // true para usar sua rota /api/places/suggest
const PLACES_API = `${API}/places/suggest`;

/** ====== ASSETS (seus ícones do Figma) ====== */
import iconActive from "../assets/Iconos/trip.png";
import iconUpcoming from "../assets/Iconos/upcoming.png";
import iconPlan from "../assets/Iconos/plan.png";
import iconShare from "../assets/Iconos/share.png";
import iconDelete from "../assets/Iconos/delete.png";
import iconAdd from "../assets/Iconos/add.png";
import iconSave from "../assets/Iconos/save.png";
import iconUpload from "../assets/Iconos/upload.png";

/** ====== MODELOS ====== */
const emptyTrip = {
  title: "",
  city: "",
  countryCode: "",
  startDate: "",
  endDate: "",
  preferences: [],
  activities: [],
  documents: [], // [{_id,name,url,mime,size}]
  flight: { outbound: null, inbound: null }, // uploads de bilhetes
  status: "upcoming", // mantido no modelo, mas sem UI
};

/** ====== MOCK DB ====== */
let MOCK_DB = [
  {
    _id: "t1",
    title: "Barcelona Getaway",
    city: "Barcelona",
    countryCode: "Spain",
    startDate: "2025-09-19",
    endDate: "2025-09-22",
    preferences: [
      "nature",
      "concerts_and_events",
      "gastronomy",
      "touristic_places",
    ],
    activities: [
      { date: "2025-09-19", time: "15:00", text: "Sagrada Família" },
      { date: "2025-09-20", time: "12:00", text: "Park Güell" },
      { date: "2025-09-20", time: "18:00", text: "La Boqueria" },
      { date: "2025-09-21", time: "16:00", text: "Casa Batlló" },
    ],
    documents: [],
    flight: { outbound: null, inbound: null },
    status: "active",
  },
  {
    _id: "t2",
    title: "Beautiful Rome",
    city: "Rome",
    countryCode: "Italy",
    startDate: "2025-10-22",
    endDate: "2025-10-28",
    preferences: [
      "nature",
      "concerts_and_events",
      "gastronomy",
      "touristic_places",
    ],
    activities: [
      { date: "2025-10-23", time: "15:00", text: "Flight" },
      { date: "2025-10-25", time: "10:30", text: "Colosseum" },
      { date: "2025-10-28", time: "16:00", text: "Flight return" },
    ],
    documents: [],
    flight: { outbound: null, inbound: null },
    status: "upcoming",
  },
];

/** ====== AUTOCOMPLETE (mock + API) ====== */
const STATIC_CITIES = [
  "Barcelona, Spain",
  "Madrid, Spain",
  "Rome, Italy",
  "Milan, Italy",
  "Paris, France",
  "Lisbon, Portugal",
  "London, United Kingdom",
];
const STATIC_COUNTRIES = [
  "Spain",
  "Italy",
  "France",
  "Portugal",
  "United Kingdom",
  "Germany",
  "Greece",
];

async function fetchPlaces(q, type) {
  if (!USE_PLACES_API) {
    const list = type === "city" ? STATIC_CITIES : STATIC_COUNTRIES;
    const term = q.toLowerCase();
    return list.filter((x) => x.toLowerCase().includes(term)).slice(0, 8);
  }
  const url = `${PLACES_API}?q=${encodeURIComponent(q)}&type=${type}`;
  const res = await fetch(url);
  return await res.json(); // espere array de strings
}

export default function TripPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState({ ...emptyTrip });

  // refs para rolar
  const secActive = useRef(null);
  const secUpcoming = useRef(null);
  const secPlan = useRef(null);
  const scrollTo = (ref) =>
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // CRUD base
  const loadTrips = async () => {
    setLoading(true);
    setError("");
    try {
      if (USE_API) {
        const res = await fetch(`${API}/trips`);
        const data = await res.json();
        setTrips(data);
      } else {
        setTrips([...MOCK_DB]);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (payload) => {
    setError("");
    try {
      if (USE_API) {
        const res = await fetch(`${API}/trips`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setTrips((t) => [created, ...t]);
      } else {
        const created = { ...payload, _id: crypto.randomUUID() };
        MOCK_DB = [created, ...MOCK_DB];
        setTrips((t) => [created, ...t]);
      }
      setDraft({ ...emptyTrip });
    } catch (e) {
      console.error(e);
      setError("Failed to create trip.");
    }
  };

  const updateTrip = async (id, patch) => {
    setSavingId(id);
    setError("");
    try {
      if (USE_API) {
        const res = await fetch(`${API}/trips/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        const updated = await res.json();
        setTrips((t) => t.map((x) => (x._id === id ? updated : x)));
      } else {
        MOCK_DB = MOCK_DB.map((x) => (x._id === id ? { ...x, ...patch } : x));
        setTrips((t) => t.map((x) => (x._id === id ? { ...x, ...patch } : x)));
      }
    } catch (e) {
      console.error(e);
      setError("Failed to update trip.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteTrip = async (id) => {
    if (!confirm("Delete this trip?")) return;
    setError("");
    try {
      if (USE_API) {
        await fetch(`${API}/trips/${id}`, { method: "DELETE" });
        setTrips((t) => t.filter((x) => x._id !== id));
      } else {
        MOCK_DB = MOCK_DB.filter((x) => x._id !== id);
        setTrips((t) => t.filter((x) => x._id !== id));
      }
    } catch (e) {
      console.error(e);
      setError("Failed to delete trip.");
    }
  };

  // Nested: activities
  const addActivity = (id, item) =>
    updateTrip(id, {
      activities: [
        ...(trips.find((t) => t._id === id)?.activities || []),
        item,
      ],
    });

  // Upload múltiplo de documentos
  const addDocumentsFiles = async (id, files) => {
    const trip = trips.find((t) => t._id === id);
    if (!trip) return;
    let newDocs = [];
    if (USE_API) {
      const fd = new FormData();
      [...files].forEach((f) => fd.append("files", f));
      const res = await fetch(`${API}/trips/${id}/documents`, {
        method: "POST",
        body: fd,
      });
      newDocs = await res.json(); // [{_id,name,url,mime,size}]
    } else {
      newDocs = [...files].map((f) => ({
        _id: crypto.randomUUID(),
        name: f.name,
        url: URL.createObjectURL(f),
        mime: f.type,
        size: f.size,
      }));
    }
    updateTrip(id, { documents: [...(trip.documents || []), ...newDocs] });
  };

  const deleteDocument = async (id, docId) => {
    const trip = trips.find((t) => t._id === id);
    if (!trip) return;
    if (USE_API)
      await fetch(`${API}/trips/${id}/documents/${docId}`, {
        method: "DELETE",
      });
    updateTrip(id, {
      documents: (trip.documents || []).filter((d) => d._id !== docId),
    });
  };

  // Upload de bilhetes (Outbound/Return)
  const setFlightTicket = async (id, which, file) => {
    const trip = trips.find((t) => t._id === id);
    if (!trip) return;
    let doc;
    if (USE_API) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/trips/${id}/flight?which=${which}`, {
        method: "POST",
        body: fd,
      });
      doc = await res.json();
    } else {
      doc = {
        _id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        mime: file.type,
        size: file.size,
      };
    }
    updateTrip(id, { flight: { ...(trip.flight || {}), [which]: doc } });
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const active = useMemo(
    () => trips.filter((t) => t.status === "active"),
    [trips]
  );
  const upcoming = useMemo(
    () => trips.filter((t) => t.status === "upcoming"),
    [trips]
  );

  const prefList = [
    { key: "nature", label: "Nature" },
    { key: "concerts_and_events", label: "Concerts & Events" },
    { key: "gastronomy", label: "Gastronomy" },
    { key: "touristic_places", label: "Touristic places" },
  ];

  return (
    <div className="trip-page">
      <h1 className="sr-only">Trip planner</h1>

      {/* chips que rolam até a seção */}
      <aside className="tp-quick">
        <button className="tp-chip" onClick={() => scrollTo(secActive)}>
          <img src={iconActive} alt="" /> <span>Active trip</span>
        </button>
        <button className="tp-chip" onClick={() => scrollTo(secUpcoming)}>
          <img src={iconUpcoming} alt="" /> <span>Upcoming</span>
        </button>
        <button className="tp-chip" onClick={() => scrollTo(secPlan)}>
          <img src={iconPlan} alt="" /> <span>Plan</span>
        </button>
      </aside>

      {error && <div className="tp-error">{error}</div>}
      {loading && <div className="tp-loading">Loading trips…</div>}

      {/* Active */}
      <Section
        refEl={secActive}
        title="Active trip"
        icon={<img src={iconActive} alt="" />}
      >
        {active.length === 0 && <Empty text="No active trip." />}
        {active.map((t) => (
          <TripCard
            key={t._id}
            trip={t}
            prefList={prefList}
            saving={savingId === t._id}
            onUpdate={updateTrip}
            onDelete={deleteTrip}
            onAddActivity={addActivity}
            onAddDocuments={addDocumentsFiles}
            onDeleteDocument={deleteDocument}
            onSetFlight={setFlightTicket}
          />
        ))}
      </Section>

      {/* Upcoming */}
      <Section
        refEl={secUpcoming}
        title="Upcoming"
        icon={<img src={iconUpcoming} alt="" />}
      >
        {upcoming.length === 0 && <Empty text="No upcoming trips." />}
        {upcoming.map((t) => (
          <TripCard
            key={t._id}
            trip={t}
            prefList={prefList}
            saving={savingId === t._id}
            onUpdate={updateTrip}
            onDelete={deleteTrip}
            onAddActivity={addActivity}
            onAddDocuments={addDocumentsFiles}
            onDeleteDocument={deleteDocument}
            onSetFlight={setFlightTicket}
          />
        ))}
      </Section>

      {/* Create */}
      <Section
        refEl={secPlan}
        title="Plan a new trip"
        icon={<img src={iconPlan} alt="" />}
      >
        <NewTripForm
          draft={draft}
          setDraft={setDraft}
          prefList={prefList}
          onCreate={createTrip}
        />
      </Section>
    </div>
  );
}

/** ====== SUB-COMPONENTES ====== */

function Section({ title, icon, children, refEl }) {
  return (
    <section className="tp-section" ref={refEl}>
      <header className="tp-section-hd">
        <span className="tp-icon">{icon}</span>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return <div className="tp-empty">{text}</div>;
}

/** Autocomplete simples (mock + API). */
function AutoCompleteInput({ label, value, onChange, type }) {
  const [q, setQ] = useState(value || "");
  const [opts, setOpts] = useState([]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setQ(value || "");
  }, [value]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!q || q.length < 2) {
        setOpts([]);
        return;
      }
      const data = await fetchPlaces(q, type);
      if (!ignore) setOpts(data);
    };
    const t = setTimeout(run, 200); // debounce
    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [q, type]);

  return (
    <label className="tp-col">
      <span>{label}</span>
      <div className="tp-ac">
        <input
          value={q}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => {
            setQ(e.target.value);
            onChange?.(e.target.value);
          }}
          placeholder={type === "city" ? "City" : "Country"}
          aria-autocomplete="list"
          aria-expanded={focused && opts.length > 0}
        />
        {focused && opts.length > 0 && (
          <ul className="tp-ac-list">
            {opts.map((o) => (
              <li
                key={o}
                onMouseDown={() => {
                  setQ(o);
                  onChange?.(o);
                }}
              >
                {o}
              </li>
            ))}
          </ul>
        )}
      </div>
    </label>
  );
}

function TripCard({
  trip,
  prefList,
  saving,
  onUpdate,
  onDelete,
  onAddActivity,
  onAddDocuments,
  onDeleteDocument,
  onSetFlight,
}) {
  const [local, setLocal] = useState(trip);
  const [act, setAct] = useState({ date: "", time: "", text: "" });

  useEffect(() => {
    if (trip) setLocal(trip);
  }, [trip]);

  // Compartilhar: pega City, Country, Start, End e (opcional) Preferences
  const handleShare = async () => {
    const includePrefs = confirm("Include preferences in the post?");
    const payload = {
      tripId: trip._id,
      city: local.city,
      country: local.countryCode,
      startDate: local.startDate,
      endDate: local.endDate,
      ...(includePrefs ? { preferences: local.preferences || [] } : {}),
    };
    try {
      if (USE_API) {
        await fetch(`${API}/trips/${trip._id}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      alert("Trip shared to feed!");
    } catch (e) {
      console.error(e);
      alert("Failed to share.");
    }
  };

  return (
    <div className="tp-card">
      {/* Título + Ações (save/delete/share) */}
      <div className="tp-card-row">
        <input
          className="tp-title"
          value={local.title}
          onChange={(e) => setLocal({ ...local, title: e.target.value })}
          placeholder="Trip title"
        />
        <div className="tp-card-actions">
          <button
            className="iconbtn"
            onClick={handleShare}
            title="Share to feed"
            aria-label="Share to feed"
          >
            <img src={iconShare} alt="" />
            <span className="hide-sm">Share</span>
          </button>
          <button
            className="tp-ghost"
            onClick={() => onUpdate(trip._id, local)}
            disabled={saving}
          >
            <img src={iconSave} alt="" />
            Save
          </button>
          <button
            className="iconbtn danger"
            onClick={() => onDelete(trip._id)}
            title="Delete"
            aria-label="Delete trip"
          >
            <img src={iconDelete} alt="" />
            <span className="hide-sm">Delete</span>
          </button>
        </div>
      </div>

      {/* Linha principal (sem One-way/Return e sem Status) */}
      <div className="tp-meta">
        <AutoCompleteInput
          label="City"
          type="city"
          value={local.city}
          onChange={(v) => setLocal({ ...local, city: v })}
        />
        <AutoCompleteInput
          label="Country"
          type="country"
          value={local.countryCode}
          onChange={(v) => setLocal({ ...local, countryCode: v })}
        />
        <label>
          <span>Start</span>
          <input
            type="date"
            value={local.startDate?.slice(0, 10) || ""}
            onChange={(e) => setLocal({ ...local, startDate: e.target.value })}
          />
        </label>
        <label>
          <span>End</span>
          <input
            type="date"
            value={local.endDate?.slice(0, 10) || ""}
            onChange={(e) => setLocal({ ...local, endDate: e.target.value })}
          />
        </label>
        {/* Espaço vazio para manter grid simétrico em telas largas */}
        <span className="tp-spacer" />
        <span className="tp-spacer" />
      </div>

      {/* Divider */}
      <hr className="tp-divider" />

      {/* Colunas: documentos | atividades | preferências + bilhetes */}
      <div className="tp-columns">
        {/* Documents */}
        <div className="tp-box">
          <div className="tp-flight-inline">
            <div className="ticket">
              <span> Outbound</span>
              {trip.flight?.outbound ? (
                <a
                  className="tp-mini"
                  href={trip.flight.outbound.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {trip.flight.outbound.name}
                </a>
              ) : (
                <label className="tp-upload sm">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onSetFlight(trip._id, "outbound", f);
                      e.target.value = "";
                    }}
                  />
                  <img src={iconUpload} alt="" />
                </label>
              )}
            </div>

            <div className="ticket">
              <span>Return</span>
              {trip.flight?.inbound ? (
                <a
                  className="tp-mini"
                  href={trip.flight.inbound.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {trip.flight.inbound.name}
                </a>
              ) : (
                <label className="tp-upload sm">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onSetFlight(trip._id, "inbound", f);
                      e.target.value = "";
                    }}
                  />
                  <img src={iconUpload} alt="" />
                </label>
              )}
            </div>
          </div>
          <h3>Documents</h3>
          <ul className="tp-list">
            {(trip.documents || []).map((d) => (
              <li key={d._id} className="tp-doc">
                <a href={d.url} target="_blank" rel="noreferrer">
                  {d.name}
                </a>
                <button
                  className="tp-mini danger"
                  onClick={() => onDeleteDocument(trip._id, d._id)}
                >
                  <img src={iconDelete} alt="" />
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <label className="tp-upload">
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              multiple
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) onAddDocuments(trip._id, files);
                e.target.value = "";
              }}
            />
            <span> Add document (PDF, Word, photo)</span>
          </label>
        </div>

        {/* Activities */}
        <div className="tp-box">
          <h3>Activities</h3>
          <ul className="tp-list">
            {(trip.activities || []).map((a, i) => (
              <li key={i}>
                {a.date} {a.time} {a.text}
              </li>
            ))}
          </ul>
          <form
            className="tp-inline"
            onSubmit={(e) => {
              e.preventDefault();
              if (!act.text.trim()) return;
              onAddActivity(trip._id, { ...act, text: act.text.trim() });
              setAct({ date: "", time: "", text: "" });
            }}
          >
            <input
              type="date"
              value={act.date}
              onChange={(e) => setAct({ ...act, date: e.target.value })}
            />
            <input
              type="time"
              value={act.time}
              onChange={(e) => setAct({ ...act, time: e.target.value })}
            />
            <input
              value={act.text}
              onChange={(e) => setAct({ ...act, text: e.target.value })}
              placeholder="Add a new activity"
            />
            <button className="tp-ghost" type="submit">
              <img src={iconAdd} alt="" /> Add
            </button>
          </form>
        </div>

        {/* Preferences + Flight uploads */}
        <div className="tp-box">
          <h3>Preferences</h3>
          <div className="tp-prefs grid">
            {prefList.map((p) => (
              <label key={p.key}>
                <input
                  type="checkbox"
                  checked={local.preferences?.includes(p.key)}
                  onChange={() =>
                    setLocal((d) => {
                      const has = d.preferences.includes(p.key);
                      const next = has
                        ? d.preferences.filter((x) => x !== p.key)
                        : [...d.preferences, p.key];
                      return { ...d, preferences: next };
                    })
                  }
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NewTripForm({ draft, setDraft, prefList, onCreate }) {
  const toggleDraftPref = (key) =>
    setDraft((d) => ({
      ...d,
      preferences: d.preferences.includes(key)
        ? d.preferences.filter((x) => x !== key)
        : [...d.preferences, key],
    }));

  return (
    <form
      className="tp-new"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          !draft.title ||
          !draft.city ||
          !draft.countryCode ||
          !draft.startDate
        ) {
          alert("Title, City, Country and Start date are required.");
          return;
        }
        onCreate(draft);
      }}
    >
      <div className="tp-grid">
        <label className="tp-col">
          <span>Title</span>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Trip name"
          />
        </label>

        <AutoCompleteInput
          label="City"
          type="city"
          value={draft.city}
          onChange={(v) => setDraft({ ...draft, city: v })}
        />
        <AutoCompleteInput
          label="Country"
          type="country"
          value={draft.countryCode}
          onChange={(v) => setDraft({ ...draft, countryCode: v })}
        />
      </div>

      <div className="tp-grid">
        <label className="tp-col">
          <span>Start</span>
          <input
            type="date"
            value={draft.startDate}
            onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
          />
        </label>
        <label className="tp-col">
          <span>End</span>
          <input
            type="date"
            value={draft.endDate}
            onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
          />
        </label>
        <span className="tp-spacer" />
      </div>

      <fieldset className="tp-prefs">
        <legend>Preferences</legend>
        {prefList.map((p) => (
          <label key={p.key}>
            <input
              type="checkbox"
              checked={draft.preferences.includes(p.key)}
              onChange={() => toggleDraftPref(p.key)}
            />
            {p.label}
          </label>
        ))}
      </fieldset>

      <div className="tp-actions">
        <button type="submit" className="tp-primary">
          Save trip
        </button>
        <button
          type="button"
          className="tp-ghost"
          onClick={() => setDraft({ ...emptyTrip })}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
