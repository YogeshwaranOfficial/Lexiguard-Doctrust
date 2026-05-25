import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, LogOut, Bell } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1eb3ff, #0078d4)' }}>
            <Shield size={18} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display font-700 text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
              LexiGuard
            </div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>DocTrust Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <NavLink to="/" end className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? 'text-white'
                : 'hover:text-white'
            }`}
            style={({ isActive }) => isActive
              ? { background: 'rgba(30,179,255,0.12)', color: '#1eb3ff', border: '1px solid rgba(30,179,255,0.2)' }
              : { color: 'var(--text-secondary)', border: '1px solid transparent' }
            }>
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/documents" className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all`}
            style={({ isActive }) => isActive
              ? { background: 'rgba(30,179,255,0.12)', color: '#1eb3ff', border: '1px solid rgba(30,179,255,0.2)' }
              : { color: 'var(--text-secondary)', border: '1px solid transparent' }
            }>
            <FileText size={16} />
            Documents
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #1eb3ff22, #0078d422)', color: '#1eb3ff', border: '1px solid rgba(30,179,255,0.3)' }}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>Admin</div>
              <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>admin@ufours.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(14,14,34,0.9)', backdropFilter: 'blur(8px)' }}>
          <h1 className="font-display text-base font-600" style={{ color: 'var(--text-primary)' }}>
            {location.pathname === '/' ? 'Dashboard' :
             location.pathname === '/documents' ? 'Document Library' : 'Document Detail'}
          </h1>
          <div className="flex items-center gap-3">
            <button className="btn-ghost text-xs" style={{ padding: '6px 12px' }}>
              <Bell size={14} />
            </button>
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Azure Connected
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
