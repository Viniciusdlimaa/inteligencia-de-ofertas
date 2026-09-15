import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

export default function Layout({ title, subtitle, action, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />

      {menuOpen && (
        <div
          className="layout__overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="layout__main">
        <Topbar
          title={title}
          subtitle={subtitle}
          action={action}
          onMenuClick={() => setMenuOpen((prev) => !prev)}
        />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
}
