import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./HomePage.css"; // CSS

const slides = [
  { src: "/images/friends.jpg", title: "Make new friends" },
  { src: "/images/enjoy.jpg", title: "Enjoy life" },
  { src: "/images/nature.jpg", title: "Explore nature together" },
  { src: "/images/astronauts.jpg", title: "Discover new experiences" },
  { src: "/images/bikes.jpg", title: "City rides" },
  { src: "/images/door.jpg", title: "Explore cultures" },
];

export default function HomePage() {
  return (
    <main className="home">
      <h1>We can do it alone, but why not together?</h1>

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
    </main>
  );
}
