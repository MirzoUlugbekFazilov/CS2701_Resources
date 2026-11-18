import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import { useWorkspace } from '../context/useWorkspace.js';
import { navigate } from '../lib/router.js';

const WORKSPACE_NAV = [
  { to: '/overview', label: 'Energy overview', icon: 'grid', short: 'Overview' },
  { to: '/devices', label: 'Devices', icon: 'device', short: 'Devices' },
  { to: '/budget', label: 'Energy budget', icon: 'battery', short: 'Budget' },
  { to: '/plan', label: 'Emergency plan', icon: 'plan', short: 'Plan' },
];

const ACCOUNT_NAV = [{ to: '/profile', label: 'Profile', icon: 'profile' }];

function BatteryStatus() {
  const { energy } = useWorkspace();
  return (
    <div className="battery-status">
      <p className="eyebrow eyebrow--xs">BACKUP BATTERY</p>
      <div className="battery-status__row">
        <span className="battery-status__value">
          {Math.round(energy.chargePercent)}%
        </span>
        <span className="battery-status__detail">
          {energy.availableKWh.toFixed(1)} / {energy.capacityKWh} kWh
        </span>
      </div>
      <div className="meter meter--sm">
        <div
          className="meter__fill"
          style={{ width: `${Math.min(100, energy.chargePercent)}%` }}
        />
      </div>
    </div>
  );
}

function NavLink({ item, active, onNavigate }) {
  return (
    <a
      className={`nav-link${active ? ' is-active' : ''}`}
      href={`#${item.to}`}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </a>
  );
}

function Sidebar({ route, onNavigate }) {
  const { signOut } = useWorkspace();

  return (
    <div className="sidebar__inner">
      <Logo size="sm" />

      <nav className="sidebar__nav" aria-label="Workspace">
        <p className="eyebrow eyebrow--xs sidebar__group">YOUR WORKSPACE</p>
        {WORKSPACE_NAV.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            active={route === item.to}
            onNavigate={onNavigate}
          />
        ))}

        <p className="eyebrow eyebrow--xs sidebar__group">ACCOUNT</p>
        {ACCOUNT_NAV.map((item) => (
          <NavLink
            key={item.to}
            item={item}
            active={route === item.to}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="sidebar__foot">
        <BatteryStatus />
        <a className="nav-link nav-link--quiet" href="#/overview" onClick={onNavigate}>
          <Icon name="help" />
          <span>Help &amp; guidance</span>
        </a>
        <button
          type="button"
          className="nav-link nav-link--quiet"
          onClick={() => {
            signOut();
            navigate('/');
          }}
        >
          <Icon name="signout" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

function TopBar({ onOpenMenu }) {
  const { profile } = useWorkspace();
  const initials = profile.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar__menu"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <Icon name="menu" />
      </button>

      <div className="topbar__venue">
        <span className="topbar__venue-name">{profile.venueName}</span>
        <Icon name="chevron" className="topbar__chevron" />
      </div>

      <div className="topbar__right">
        <span className="chip chip--quiet">Sample data</span>
        <Icon name="bell" className="topbar__bell" />
        <a className="topbar__user" href="#/profile">
          <span className="topbar__user-text">
            <span className="topbar__user-name">{profile.fullName}</span>
            <span className="topbar__user-role">{profile.role}</span>
          </span>
          <span className="avatar avatar--sm">{initials}</span>
        </a>
      </div>
    </header>
  );
}

function MobileTabs({ route }) {
  return (
    <nav className="tabbar" aria-label="Sections">
      {WORKSPACE_NAV.map((item) => (
        <a
          key={item.to}
          className={`tabbar__item${route === item.to ? ' is-active' : ''}`}
          href={`#${item.to}`}
          aria-current={route === item.to ? 'page' : undefined}
        >
          <Icon name={item.icon} />
          <span>{item.short}</span>
        </a>
      ))}
    </nav>
  );
}

export default function AppShell({ route, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(route);

  // Close the drawer whenever the route changes (adjusting state during render
  // is the recommended pattern — no extra render pass).
  if (route !== openedAt) {
    setOpenedAt(route);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className={`app${menuOpen ? ' app--menu-open' : ''}`}>
      <button
        type="button"
        className="app__scrim"
        aria-label="Close navigation"
        tabIndex={menuOpen ? 0 : -1}
        onClick={() => setMenuOpen(false)}
      />

      <aside className="sidebar">
        <Sidebar route={route} onNavigate={() => setMenuOpen(false)} />
      </aside>

      <div className="app__main">
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <main className="workspace">{children}</main>
      </div>

      <MobileTabs route={route} />
    </div>
  );
}
