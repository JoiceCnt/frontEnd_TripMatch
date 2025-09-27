// HomePage.jsx
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./HomePage.css";

/* ---- Dados ---- */
const slides = [
  { src: "/images/friends.jpg", title: "Make new friends" },
  { src: "/images/enjoy.jpg", title: "Enjoy life" },
  { src: "/images/nature.jpg", title: "Explore nature together" },
  { src: "/images/astronauts.jpg", title: "Discover new experiences" },
  { src: "/images/bikes.jpg", title: "City rides" },
  { src: "/images/door.jpg", title: "Explore cultures" },
];

const infoCards = [
  {
    id: "ny",
    title: "New York",
    img: "/images/ny.jpg",
    text: `New York City is often called “The City That Never Sleeps”, and with good reason. It’s a place where ambition meets creativity, and every street corner tells a story. From the soaring Empire State Building to the bright lights of Times Square, from Central Park’s calm green oasis to the art-filled halls of the Metropolitan Museum, New York offers endless experiences.

The city is a true melting pot of cultures, where cuisines, traditions, and languages from around the world come together. Walking through neighborhoods like Chinatown, Harlem, or Brooklyn, you’ll feel the diversity that makes New York unique. Add to that the Broadway shows, iconic yellow cabs, and the energy of Wall Street, and you’ll see why so many people dream of visiting. New York isn’t just a destination—it’s an experience of life at full speed.`,
  },
  {
    id: "paris",
    title: "Paris",
    img: "/images/paris.jpg",
    text: `Paris is a city that blends timeless beauty with modern life. If you’re visiting, start with the Eiffel Tower for breathtaking views. Then wander through the Louvre Museum, home to thousands of masterpieces, before strolling the charming streets of Montmartre. Don’t miss the Seine River cruises, especially at sunset, when the city’s monuments glow with golden light.

Paris is also about experiences: enjoy a croissant in a corner café, explore markets like Marché d’Aligre, or shop along the stylish Champs-Élysées. At night, the city comes alive with wine bars, live music, and illuminated landmarks. Whether it’s your first time or your tenth, Paris always has something new to discover.`,
  },
  {
    id: "rio",
    title: "Rio de Janeiro",
    img: "/images/rio.jpg",
    text: ` Rio de Janeiro is a city where nature and culture blend in perfect harmony. Nestled between mountains and the sea, it offers breathtaking landscapes from the top of Christ the Redeemer and Sugarloaf Mountain to the golden sands of Copacabana and Ipanema. The city pulses with rhythm, whether it’s the sounds of samba echoing through lively neighborhoods or the vibrant parades of Carnival, the world’s most famous celebration.

Beyond its festive spirit, Rio is full of everyday charm: colorful street markets, traditional food like feijoada, and the warmth of its people. Whether you’re hiking through Tijuca Forest, watching the sunset at Arpoador, or enjoying the energy of Maracanã Stadium during a football match, Rio captures the heart with its unique blend of natural beauty, cultural richness, and joy of life.`,
  },
];

/* ---- Última seção: Cards + Read more ---- */
function ReadMoreSection() {
  const [openId, setOpenId] = useState(null);
  const toggle = (id) => setOpenId((curr) => (curr === id ? null : id));

  return (
    <section className="more-cards">
      <h2>Destinations</h2>

      <div className="more-grid">
        {infoCards.map((c) => (
          <article key={c.id} className="more-card">
            <img src={c.img} alt={c.title} loading="lazy" />
            <h3>{c.title}</h3>

            <button
              className={`readmore-btn ${openId === c.id ? "active" : ""}`}
              onClick={() => toggle(c.id)}
              aria-expanded={openId === c.id}
              aria-controls={`panel-${c.id}`}
            >
              Read more
            </button>
          </article>
        ))}
      </div>

      {/* painel único abaixo dos cards */}
      <div
        className={`readmore-panel ${openId ? "open" : ""}`}
        id={`panel-${openId || "none"}`}
        role="region"
        aria-live="polite"
      >
        {openId ? (
          <p>{infoCards.find((x) => x.id === openId)?.text}</p>
        ) : (
          <p className="hint">Select a destination to read more.</p>
        )}
      </div>
    </section>
  );
}

/* ---- Página ---- */
export default function HomePage() {
  return (
    <main className="home">
      <h1>We can do it alone, but why not together?</h1>

      {/* Carrossel */}
      <section className="hero-carousel" aria-label="Highlights">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500 }}
          loop
          spaceBetween={16}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            900: { slidesPerView: 3.2 },
            1200: { slidesPerView: 4 },
          }}
          className="home-swiper"
        >
          {slides.map((s, i) => (
            <SwiperSlide key={i}>
              <article className="slide-card">
                <img src={s.src} alt={s.title} loading="lazy" />
                <span className="slide-title">{s.title}</span>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Member Stories */}
      <section className="member-stories">
        <h2>Member Stories</h2>

        <div className="stories-grid">
          <article className="story-card">
            <p>
              “Before our Mallorca trip, Henrik and I matched with Elena and
              Marco on Trip Match. They were also planning hikes in the
              Tramuntana mountains, so we set up a meet-up. What was supposed to
              be just a short walk turned into a full day together, hiking,
              sharing stories, and finishing with seafood by the sea. We still
              talk almost every week, and next summer we’re visiting them in
              Milan.”
            </p>
            <span className="author">Told by Clara</span>
          </article>

          <article className="story-card">
            <p>
              “Lukas and I were going to Barcelona for a weekend and decided to
              try this app called Trip Match. That’s how we got connected with
              Sofía and Diego, who were also in the city at the same time. We
              met up for tapas one evening and ended up spending the whole trip
              together, exploring the Gothic Quarter and watching the sunset
              from Bunkers del Carmel. Now we're close friends — they even came
              to Berlin to see the Christmas markets with us.”
            </p>
            <span className="author">Told by Anna</span>
          </article>
        </div>

        <p className="share-text">
          Share your history with us. Send an email to :
          <br />
          <a href="mailto:mybestrip@tripmatch.com">mybestrip@tripmatch.com</a>
        </p>

        <hr className="section-divider" />
      </section>

      {/* Última seção */}
      <ReadMoreSection />
    </main>
  );
}
