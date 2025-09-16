// src/components/TripMatchFooter.jsx
import { Link } from "react-router-dom";
import "./TripMatchFooter.css"; // importa o CSS separado

export default function TripMatchFooter() {
  return (
    <footer className="tm-footer" role="contentinfo" aria-label="Site footer">
      <nav className="tm-footer__nav" aria-label="Footer links">
        <Link to="/contact" className="tm-footer__link">
          Contact Us
        </Link>
        <Link to="/policy" className="tm-footer__link">
          Policy
        </Link>
        <Link to="/about" className="tm-footer__link">
          About us
        </Link>
      </nav>
    </footer>
  );
}
