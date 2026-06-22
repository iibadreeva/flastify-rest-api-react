import { Link } from 'react-router-dom'
import { useApi } from '../api.js'
import { PageHead } from '../components/ui.jsx'
import { Loader, ErrorState, EmptyState } from '../components/states.jsx'

export default function Courses() {
  const { data, error, loading } = useApi('/courses')

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />
  if (!data?.length) return <EmptyState label="Курсов пока нет" />

  return (
    <div>
      <PageHead
        eyebrow="Каталог"
        title="Курсы"
        lead="Программы обучения, созданные участниками платформы."
        count={data.length}
      />

      <div className="cards">
        {data.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`} className="card">
            <span className="card__tag">Курс №{course.id}</span>
            <h2 className="card__title">{course.name}</h2>
            <p className="card__text">{course.description}</p>
            <span className="card__cta">Подробнее →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
