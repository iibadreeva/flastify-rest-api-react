import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApi, apiPatch, apiDelete } from '../api.js'
import { BackLink, Initials } from '../components/ui.jsx'
import { Loader, ErrorState } from '../components/states.jsx'
import FormModal from '../components/FormModal.jsx'

const userFields = [
  { name: 'fullName', label: 'Полное имя', type: 'text', placeholder: 'Иван Иванов' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com' },
]

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error, loading } = useApi(`/users/${id}`)
  const [editing, setEditing] = useState(false)

  const handleEdit = async ({ fullName, email }) => {
    const body = {}
    if (fullName) body.fullName = fullName
    if (email) body.email = email

    await apiPatch(`/users/${id}`, body)
    window.location.reload()
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    try {
      await apiDelete(`/users/${id}`)
      navigate('/users')
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message)
    }
  }

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />

  const courses = data.courses ?? []

  return (
    <article className="detail">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <BackLink to="/users">Ко всем участникам</BackLink>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setEditing(true)} className="btn btn--ghost" style={{ fontSize: '13px' }}>
            Редактировать
          </button>
          <button onClick={handleDelete} className="btn btn--ghost" style={{ fontSize: '13px', color: 'var(--accent)' }}>
            Удалить
          </button>
        </div>
      </div>

      <header className="profile">
        <div className="profile__avatar">
          <Initials name={data.fullName} />
        </div>
        <div>
          <h1 className="profile__name">{data.fullName ?? 'Без имени'}</h1>
          <a className="profile__email" href={`mailto:${data.email}`}>
            {data.email}
          </a>
        </div>
      </header>

      <section className="detail__section">
        <h2 className="detail__heading">
          Созданные курсы <span className="detail__count">{courses.length}</span>
        </h2>

        {courses.length === 0 ? (
          <p className="detail__muted">Этот участник пока не создавал курсов.</p>
        ) : (
          <div className="cards">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="card"
              >
                <span className="card__tag">Курс №{course.id}</span>
                <h3 className="card__title">{course.name}</h3>
                <p className="card__text">{course.description}</p>
                <span className="card__cta">Подробнее →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <FormModal
        open={editing}
        title="Редактировать участника"
        submitLabel="Сохранить"
        fields={userFields}
        initialValues={{ fullName: data.fullName ?? '', email: data.email ?? '' }}
        onClose={() => setEditing(false)}
        onSubmit={handleEdit}
      />
    </article>
  )
}
