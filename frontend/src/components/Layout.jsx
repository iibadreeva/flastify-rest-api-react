import { NavLink, Link } from 'react-router-dom'

const links = [
  { to: '/users', label: 'Участники', index: '01' },
  { to: '/courses', label: 'Курсы', index: '02' },
  { to: '/lessons', label: 'Уроки', index: '03' },
]

export default function Layout({ children }) {
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
          <p>REST API на Fastify + Drizzle</p>
          <p className="sidebar__muted">Данные генерируются сидами</p>
        </div>
      </aside>

      <main className="content">{children}</main>
    </div>
  )
}
