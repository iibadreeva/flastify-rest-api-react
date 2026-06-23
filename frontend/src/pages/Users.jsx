import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApi, apiPost, apiDelete } from '../api.js'
import { PageHead, Initials } from '../components/ui.jsx'
import { Loader, ErrorState, EmptyState } from '../components/states.jsx'
import FormModal from '../components/FormModal.jsx'
import Pagination from '../components/Pagination.jsx'

const userFields = [
  { name: 'fullName', label: 'Полное имя', type: 'text', placeholder: 'Иван Иванов' },
  { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com' },
]

export default function Users() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const { data: result, error, loading } = useApi(`/users?page=${page}`)
  const [creating, setCreating] = useState(false)

  const handleCreate = async ({ fullName, email }) => {
    const body = { email }
    if (fullName) body.fullName = fullName

    await apiPost('/users', body)
    window.location.reload()
  }

  const handleDelete = async (e, id) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return

    try {
      await apiDelete(`/users/${id}`)
      window.location.reload()
    } catch (err) {
      alert('Ошибка при удалении: ' + err.message)
    }
  }

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />

  const users = result?.data ?? []
  const meta = result?.meta
  // Число страниц считаем из метаданных списка (total / perPage).
  const totalPages = meta ? Math.ceil(meta.total / meta.perPage) : 1

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PageHead
          eyebrow="Сообщество"
          title="Участники"
          lead="Авторы и студенты платформы."
          count={meta?.total ?? users.length}
        />
        <button onClick={() => setCreating(true)} className="btn btn--primary" style={{ marginTop: '20px' }}>
          Добавить участника
        </button>
      </div>

      {!users.length && page === 1 ? (
        <EmptyState label="Участников пока нет" />
      ) : (
        <>
          <ul className="people">
            {users.map((user) => (
              <li key={user.id}>
                <Link to={`/users/${user.id}`} className="person">
                  <Initials name={user.fullName} />
                  <span className="person__body">
                    <span className="person__name">
                      {user.fullName ?? 'Без имени'}
                    </span>
                    <span className="person__email">{user.email}</span>
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, user.id)}
                    className="btn btn--ghost"
                    style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: '12px' }}
                  >
                    Удалить
                  </button>
                  <span className="person__arrow">→</span>
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
        title="Новый участник"
        submitLabel="Создать"
        fields={userFields}
        onClose={() => setCreating(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
