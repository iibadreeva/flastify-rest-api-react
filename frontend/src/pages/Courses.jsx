import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApi, apiPost, apiDelete } from '../api.js'
import { PageHead } from '../components/ui.jsx'
import { Loader, ErrorState, EmptyState } from '../components/states.jsx'
import FormModal from '../components/FormModal.jsx'
import Pagination from '../components/Pagination.jsx'

const courseFields = [
  { name: 'name', label: 'Название', type: 'text', required: true, placeholder: 'Название курса' },
  { name: 'description', label: 'Описание', type: 'textarea', required: true, placeholder: 'Краткое описание курса' },
]

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const { data: result, error, loading } = useApi(`/courses?page=${page}`)
  const [creating, setCreating] = useState(false)

  const handleCreate = async (values) => {
    // creatorId не отправляем: сервер проставит автора из токена.
    await apiPost('/courses', {
      name: values.name,
      description: values.description,
    })
    window.location.reload()
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Удалить этот курс?')) return

    try {
      await apiDelete(`/courses/${id}`)
      window.location.reload()
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message)
    }
  }

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />

  const courses = result?.data ?? []
  const meta = result?.meta
  // Число страниц считаем из метаданных списка (total / perPage).
  const totalPages = meta ? Math.ceil(meta.total / meta.perPage) : 1

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHead
          eyebrow="Каталог"
          title="Курсы"
          lead="Программы обучения, созданные участниками платформы."
          count={meta?.total ?? courses.length}
        />
        <button onClick={() => setCreating(true)} className="btn btn--primary" style={{ marginTop: '20px' }}>
          Добавить курс
        </button>
      </div>

      {!courses.length && page === 1 ? (
        <EmptyState label="Курсов пока нет" />
      ) : (
        <>
          <div className="cards">
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="card">
                <span className="card__tag">Курс №{course.id}</span>
                <h2 className="card__title">{course.name}</h2>
                <p className="card__text">{course.description}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card__cta">Подробнее →</span>
                  <button
                    onClick={(e) => handleDelete(e, course.id)}
                    className="btn btn--ghost"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                  >
                    Удалить
                  </button>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => setSearchParams({ page: p })}
          />
        </>
      )}

      <FormModal
        open={creating}
        title="Новый курс"
        submitLabel="Создать"
        fields={courseFields}
        onClose={() => setCreating(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
