import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { Initials } from './ui.jsx'
import AuthModal from './AuthModal.jsx'

const links = [
  { to: '/users', label: 'Участники', index: '01' },
  { to: '/courses', label: 'Курсы', index: '02' },
  { to: '/lessons', label: 'Уроки', index: '03' },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <span className="brand__mark">✶</span>
          <span className="brand__text">
            Flastify
            <em>Академия знаний</em>
          </span>
        </Link>

        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'nav__link nav__link--active' : 'nav__link'
              }
            >
              <span className="nav__index">{link.index}</span>
              <span className="nav__label">{link.label}</span>
              <span className="nav__arrow">→</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          {user ? (
            <div className="account">
              <Initials name={user.fullName} />
              <span className="account__info">
                <span className="account__name">
                  {user.fullName ?? 'Без имени'}
                </span>
                <span className="account__email">{user.email}</span>
              </span>
              <button
                type="button"
                className="account__logout"
                onClick={logout}
              >
                Выйти
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--primary account__login"
              onClick={() => setAuthOpen(true)}
            >
              Войти
            </button>
          )}

          <p className="sidebar__muted">REST API на Fastify + Drizzle</p>
        </div>
      </aside>

      <main className="content">{children}</main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
