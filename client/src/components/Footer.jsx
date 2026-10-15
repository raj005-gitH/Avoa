import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer">
      <span>© {CURRENT_YEAR} Avoa, Inc. — Find Your Next Stay</span>
      <div className="footer__links">
        <Link to="/">Home</Link>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <a href="#">Support</a>
      </div>
    </footer>
  );
}
