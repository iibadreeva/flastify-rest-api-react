import { Link, useParams } from 'react-router-dom'
import { useApi } from '../api.js'
import { BackLink } from '../components/ui.jsx'
import { Loader, ErrorState } from '../components/states.jsx'

export default function CourseDetail() {
  const { id } = useParams()
  const { data, error, loading } = useApi(`/courses/${id}`)

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />

  const lessons = data.lessons ?? []

  return (
    <article className="detail">
      <BackLink to="/courses">Ко всем курсам</BackLink>

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
          Уроки курса <span className="detail__count">{lessons.length}</span>
        </h2>

        {lessons.length === 0 ? (
          <p className="detail__muted">В этом курсе пока нет уроков.</p>
        ) : (
          <ol className="syllabus">
            {lessons.map((lesson, i) => (
              <li key={lesson.id}>
                <Link to={`/lessons/${lesson.id}`} className="syllabus__item">
                  <span className="syllabus__num">
                    {String(i + 1).padStart(2, '0')}
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
        )}
      </section>
    </article>
  )
}
