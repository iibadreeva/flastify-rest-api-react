import { Link } from 'react-router-dom'
import { useApi } from '../api.js'
import { PageHead } from '../components/ui.jsx'
import { Loader, ErrorState, EmptyState } from '../components/states.jsx'

export default function Lessons() {
  const { data, error, loading } = useApi('/lessons')

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />
  if (!data?.length) return <EmptyState label="Уроков пока нет" />

  return (
    <div>
      <PageHead
        eyebrow="Материалы"
        title="Уроки"
        lead="Отдельные материалы, входящие в курсы."
        count={data.length}
      />

      <ul className="lessons">
        {data.map((lesson) => (
          <li key={lesson.id}>
            <Link to={`/lessons/${lesson.id}`} className="lesson">
              <span className="lesson__num">
                {String(lesson.id).padStart(2, '0')}
              </span>
              <span className="lesson__body">
                <span className="lesson__title">{lesson.name}</span>
                <span className="lesson__excerpt">{lesson.body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
