import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApi, apiPatch, apiDelete } from '../api.js'
import { BackLink } from '../components/ui.jsx'
import { Loader, ErrorState } from '../components/states.jsx'
import FormModal from '../components/FormModal.jsx'

const lessonFields = [
  { name: 'name', label: 'Название', type: 'text', required: true, placeholder: 'Название урока' },
  { name: 'body', label: 'Содержание', type: 'textarea', required: true, placeholder: 'Текст урока' },
  { name: 'courseId', label: 'ID курса', type: 'number', required: true, placeholder: 'Например, 1' },
]

export default function LessonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error, loading } = useApi(`/lessons/${id}`)
  const [editing, setEditing] = useState(false)

  const handleEdit = async (values) => {
    await apiPatch(`/lessons/${id}`, {
      name: values.name,
      body: values.body,
      courseId: values.courseId === '' ? undefined : Number(values.courseId),
    })
    window.location.reload()
  }

  const handleDelete = async () => {
    if (!confirm('Удалить этот урок?')) return

    try {
      await apiDelete(`/lessons/${id}`)
      navigate('/lessons')
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message)
    }
  }

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />

  return (
    <article className="detail">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <BackLink to="/lessons">Ко всем урокам</BackLink>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setEditing(true)} className="btn btn--ghost" style={{ fontSize: '13px' }}>
            Редактировать
          </button>
          <button onClick={handleDelete} className="btn btn--ghost" style={{ fontSize: '13px', color: 'var(--accent)' }}>
            Удалить
          </button>
        </div>
      </div>

      <header className="detail__hero">
        <p className="detail__eyebrow">Урок №{data.id}</p>
        <h1 className="detail__title">{data.name}</h1>
        <p className="detail__meta">
          Входит в{' '}
          <Link to={`/courses/${data.courseId}`} className="link">
            курс №{data.courseId}
          </Link>
        </p>
      </header>

      <section className="reader">
        <p>{data.body}</p>
      </section>

      <FormModal
        open={editing}
        title="Редактировать урок"
        submitLabel="Сохранить"
        fields={lessonFields}
        initialValues={{
          name: data.name ?? '',
          body: data.body ?? '',
          courseId: data.courseId ?? '',
        }}
        onClose={() => setEditing(false)}
        onSubmit={handleEdit}
      />
    </article>
  )
}
