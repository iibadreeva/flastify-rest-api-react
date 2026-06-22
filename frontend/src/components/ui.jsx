import { Link } from 'react-router-dom'

export function PageHead({ eyebrow, title, lead, count }) {
  return (
    <header className="page-head">
      {eyebrow && <p className="page-head__eyebrow">{eyebrow}</p>}
      <div className="page-head__row">
        <h1 className="page-head__title">{title}</h1>
        {count != null && <span className="page-head__count">{count}</span>}
      </div>
      {lead && <p className="page-head__lead">{lead}</p>}
    </header>
  )
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="backlink">
      <span aria-hidden="true">←</span> {children}
    </Link>
  )
}

export function Initials({ name }) {
  const initials = (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return <span className="initials">{initials || '?'}</span>
}
