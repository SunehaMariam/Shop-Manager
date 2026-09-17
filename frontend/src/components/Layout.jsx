import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const superLinks = [
  { to: '/', label: 'Overview', icon: '▣', end: true },
  { to: '/companies', label: 'Companies', icon: '▤' }
];

const companyLinks = [
  { to: '/', label: 'Overview', icon: '▣', end: true },
  { to: '/shops', label: 'Shops', icon: '▤' },
  { to: '/production-areas', label: 'Production areas', icon: '▥' },
  { to: '/products', label: 'Products', icon: '▦' },
  { to: '/team', label: 'Team', icon: '▧' }
];

export default function Layout({ children }) {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isSuperAdmin ? superLinks : companyLinks;

  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SM</div>
          <div>
            <div className="brand-name">Shop Manager</div>
            <div className="brand-sub">{isSuperAdmin ? 'Platform control' : user?.company?.name || 'Company'}</div>
          </div>
        </div>

        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              <span className="nav-icon" aria-hidden="true">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="who">
            <div className="who-name">{user?.name}</div>
            <div className="who-role">
              {user?.role === 'superadmin' ? 'Super admin' : user?.role === 'admin' ? 'Company admin' : 'Staff'}
            </div>
          </div>
          <button className="btn ghost sm" style={{ width: '100%' }} onClick={signOut}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div>
            <strong>{isSuperAdmin ? 'All companies' : user?.company?.name}</strong>
            <div className="cell-sub">
              {isSuperAdmin
                ? 'You manage every company on the platform'
                : 'You only see data that belongs to this company'}
            </div>
          </div>
          <span className="badge on">{user?.email}</span>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
