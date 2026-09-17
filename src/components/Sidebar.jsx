import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/ofertas', label: 'Ofertas', icon: IconList },
  { to: '/ofertas/nova', label: 'Nova oferta', icon: IconPlus },
];

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="2" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="10" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="10" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="3.5" width="14" height="2.2" rx="1" fill="currentColor" />
      <rect x="2" y="8" width="14" height="2.2" rx="1" fill="currentColor" />
      <rect x="2" y="12.5" width="9" height="2.2" rx="1" fill="currentColor" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
      <path
        d="M7 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3M12 12l3-3-3-3M15 9H7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Sidebar({ open, onNavigate }) {
  const { sair } = useAuth();
  const navigate = useNavigate();

  async function handleSair() {
    await sair();
    navigate('/login', { replace: true });
  }

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__brand-mark" aria-hidden="true" />
        <span className="sidebar__brand-name">
          Offer<span className="sidebar__brand-name--muted">Intelligence</span>
        </span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__footer-title">Monitoramento</p>
        <p className="sidebar__footer-text">
          Sistema conectado e dados atualizados.
        </p>
        <button type="button" className="sidebar__logout" onClick={handleSair}>
          <IconLogout />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
