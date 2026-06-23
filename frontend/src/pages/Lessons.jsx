import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApi, useAllItems, apiPost, apiDelete } from '../api.js'
import { PageHead } from '../components/ui.jsx'
import { Loader, ErrorState, EmptyState } from '../components/states.jsx'
import FormModal from '../components/FormModal.jsx'
import Pagination from '../components/Pagination.jsx'

export default function Lessons() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const { data: result, error, loading } = useApi(`/lessons?page=${page}`)
  const courses = useAllItems('/courses')
  const [creating, setCreating] = useState(false)

  const lessonFields = [
    { name: 'name', label: 'Название', type: 'text', required: true, placeholder: 'Название урока' },
    { name: 'body', label: 'Содержание', type: 'textarea', required: true, placeholder: 'Текст урока' },
    {
      name: 'courseId',
      label: 'Курс',
      type: 'select',
      required: true,
      options: courses.map((course) => ({
        value: course.id,
        label: `№${course.id} — ${course.name}`,
      })),
    },
  ]

  const handleCreate = async (values) => {
    await apiPost('/lessons', {
      name: values.name,
      body: values.body,
      courseId: values.courseId === '' ? undefined : Number(values.courseId),
    })
    window.location.reload()
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Удалить этот урок?')) return

    try {
      await apiDelete(`/lessons/${id}`)
      window.location.reload()
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message)
    }
  }

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />

  const lessons = result?.data ?? []
  const meta = result?.meta
  // Число страниц считаем из метаданных списка (total / perPage).
  const totalPages = meta ? Math.ceil(meta.total / meta.perPage) : 1

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHead
          eyebrow="Материалы"
          title="Уроки"
          lead="Отдельные материалы, входящие в курсы."
          count={meta?.total ?? lessons.length}
        />
        <button onClick={() => setCreating(true)} className="btn btn--primary" style={{ marginTop: '20px' }}>
          Добавить урок
        </button>
      </div>

      {!lessons.length && page === 1 ? (
        <EmptyState label="Уроков пока нет" />
      ) : (
        <>
          <ul className="lessons">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link to={`/lessons/${lesson.id}`} className="lesson">
                  <span className="lesson__num">
                    {String(lesson.id).padStart(2, '0')}
                  </span>
                  <span className="lesson__body">
                    <span className="lesson__title">{lesson.name}</span>
                    <span className="lesson__excerpt">{lesson.body}</span>
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, lesson.id)}
                    className="btn btn--ghost"
                    style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '12px', alignSelf: 'center' }}
                  >
                    Удалить
                  </button>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => setSearchParams({ page: p })}
          />
        </>
      )}

      <FormModal
        open={creating}
        title="Новый урок"
        submitLabel="Создать"
        fields={lessonFields}
        onClose={() => setCreating(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
