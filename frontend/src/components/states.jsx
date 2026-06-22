export function Loader({ label = 'Загружаем данные' }) {
  return (
    <div className="state">
      <div className="state__spinner" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="state__text">{label}…</p>
    </div>
  )
}

export function ErrorState({ error }) {
  return (
    <div className="state state--error">
      <p className="state__badge">Ошибка</p>
      <p className="state__text">{error?.message ?? 'Что-то пошло не так'}</p>
      <p className="state__hint">
        Проверь, что API запущен на <code>http://localhost:3000</code>.
      </p>
    </div>
  )
}

export function EmptyState({ label = 'Пока ничего нет' }) {
  return (
    <div className="state">
      <p className="state__text">{label}</p>
    </div>
  )
}
