import { Link } from 'react-router-dom';
import './Topbar.css';

export default function Topbar({ title, subtitle, onMenuClick, action }) {
  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar__menu-btn"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 5.5h14M3 10h14M3 14.5h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="topbar__titles">
        <h1 className="topbar__title">{title}</h1>
        {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
      </div>

      {action && (
        <Link to={action.to} className="topbar__action">
          {action.label}
        </Link>
      )}
    </header>
  );
}
