// Layout — navigation bar with Azure login button (Module 06)
import { Link, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/msalConfig';

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/notes',     label: 'Notes' },
  { to: '/files',     label: 'Files' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Layout({ children }) {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();

  const user = accounts[0];

  function handleLogin() {
    instance.loginPopup(loginRequest).catch(console.error);
  }
  function handleLogout() {
    instance.logoutPopup({ postLogoutRedirectUri: '/' }).catch(console.error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Nav ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2 font-semibold text-azure-700 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M33 6L6 54l15 6 36-36L33 6z" fill="#0078D4"/>
              <path d="M54 18L30 60l36 30 24-84H54z" fill="#0078D4" opacity="0.7"/>
            </svg>
            Azure Notes
          </div>

          {/* Nav links */}
          <nav className="flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  location.pathname === to
                    ? 'bg-azure-50 text-azure-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth (Module 06) */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
              <button onClick={handleLogout} className="btn-secondary text-xs">Sign out</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="btn-primary text-xs">Sign in with Microsoft</button>
          )}
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
        Azure Developer Course — AZ-204 Practice Project
      </footer>
    </div>
  );
}
