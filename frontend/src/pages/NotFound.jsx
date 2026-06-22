import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="notfound">
      <p className="notfound__code">404</p>
      <h1 className="notfound__title">Страница не найдена</h1>
      <p className="notfound__text">
        Похоже, такой страницы здесь нет.
      </p>
      <Link to="/" className="btn btn--primary">
        На главную
      </Link>
    </div>
  )
}
