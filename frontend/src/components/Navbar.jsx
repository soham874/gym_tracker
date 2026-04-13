import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/add', label: 'Add Data' },
  { to: '/view', label: 'View Data' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-white font-bold text-lg tracking-tight">
            Gym Tracker
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.to
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}

            {user && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-indigo-500">
                {user.picture && (
                  <img src={user.picture} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                )}
                <span className="text-indigo-100 text-sm font-medium hidden lg:inline">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 rounded text-xs font-medium text-indigo-200 hover:text-white hover:bg-indigo-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden text-indigo-100 hover:text-white focus:outline-none"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden px-2 pb-3 pt-2 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === l.to
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-100 hover:bg-indigo-500 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 border-t border-indigo-500 mt-2 pt-3">
              {user.picture && (
                <img src={user.picture} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
              )}
              <span className="text-indigo-100 text-sm font-medium flex-1">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-indigo-200 hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
