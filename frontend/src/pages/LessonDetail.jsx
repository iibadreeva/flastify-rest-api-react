import { Link, useParams } from 'react-router-dom'
import { useApi } from '../api.js'
import { BackLink } from '../components/ui.jsx'
import { Loader, ErrorState } from '../components/states.jsx'

export default function LessonDetail() {
  const { id } = useParams()
  const { data, error, loading } = useApi(`/lessons/${id}`)

  if (loading) return <Loader />
  if (error) return <ErrorState error={error} />

  return (
    <article className="detail">
      <BackLink to="/lessons">Ко всем урокам</BackLink>

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
    </article>
  )
}
