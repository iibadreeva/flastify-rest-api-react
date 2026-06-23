import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApi, apiPatch, apiDelete } from '../api.js'
import { BackLink } from '../components/ui.jsx'
import { Loader, ErrorState } from '../components/states.jsx'
import FormModal from '../components/FormModal.jsx'
import Pagination from '../components/Pagination.jsx'

const courseFields = [
  { name: 'name', label: 'Название', type: 'text', required: true, placeholder: 'Название курса' },
  { name: 'description', label: 'Описание', type: 'textarea', required: true, placeholder: 'Краткое описание курса' },
]

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error, loading } = useApi(`/courses/${id}`)
  const [editing, setEditing] = useState(false)
  // Уроки тянем через вложенный ресурс /courses/:id/lessons со своей пагинацией.
  const [lessonsPage, setLessonsPage] = useState(1)
  const { data: lessonsResult } = useApi(`/courses/${id}/lessons?page=${lessonsPage}`)

  const handleEdit = async (values) => {
    await apiPatch(`/courses/${id}`, {
      name: values.name,
      description: values.description,
    })
    window.location.reload()
  }

  const handleDelete = async () => {
    if (!confirm('Удалить этот курс?')) return

    try {
      await apiDelete(`/courses/${id}`)
      navigate('/courses')
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message)
    }
  }

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />

  const lessons = lessonsResult?.data ?? []
  const lessonsMeta = lessonsResult?.meta
  const totalLessons = lessonsMeta?.total ?? lessons.length
  const totalLessonPages = lessonsMeta
    ? Math.ceil(lessonsMeta.total / lessonsMeta.perPage)
    : 1
  // Сквозная нумерация уроков с учётом текущей страницы.
  const lessonOffset = lessonsMeta
    ? (lessonsPage - 1) * lessonsMeta.perPage
    : 0

  return (
    <article className="detail">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <BackLink to="/courses">Ко всем курсам</BackLink>
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
        <p className="detail__eyebrow">Курс №{data.id}</p>
        <h1 className="detail__title">{data.name}</h1>
        <p className="detail__lead">{data.description}</p>
        <p className="detail__meta">
          Автор:{' '}
          <Link to={`/users/${data.creatorId}`} className="link">
            участник №{data.creatorId}
          </Link>
        </p>
      </header>

      <section className="detail__section">
        <h2 className="detail__heading">
          Уроки курса <span className="detail__count">{totalLessons}</span>
        </h2>

        {lessons.length === 0 ? (
          <p className="detail__muted">В этом курсе пока нет уроков.</p>
        ) : (
          <>
            <ol className="syllabus">
              {lessons.map((lesson, i) => (
                <li key={lesson.id}>
                  <Link to={`/lessons/${lesson.id}`} className="syllabus__item">
                    <span className="syllabus__num">
                      {String(lessonOffset + i + 1).padStart(2, '0')}
                    </span>
                    <span className="syllabus__body">
                      <span className="syllabus__title">{lesson.name}</span>
                      <span className="syllabus__excerpt">{lesson.body}</span>
                    </span>
                    <span className="syllabus__arrow">→</span>
                  </Link>
                </li>
              ))}
            </ol>

            <Pagination
              page={lessonsPage}
              totalPages={totalLessonPages}
              onChange={setLessonsPage}
            />
          </>
        )}
      </section>

      <FormModal
        open={editing}
        title="Редактировать курс"
        submitLabel="Сохранить"
        fields={courseFields}
        initialValues={{
          name: data.name ?? '',
          description: data.description ?? '',
        }}
        onClose={() => setEditing(false)}
        onSubmit={handleEdit}
      />
    </article>
  )
}
