import { Link } from 'react-router-dom'

const cards = [
  {
    to: '/users',
    index: '01',
    title: 'Участники',
    text: 'Авторы и студенты платформы. Открой профиль, чтобы увидеть созданные курсы.',
  },
  {
    to: '/courses',
    index: '02',
    title: 'Курсы',
    text: 'Программы обучения с описанием, автором и списком входящих уроков.',
  },
  {
    to: '/lessons',
    index: '03',
    title: 'Уроки',
    text: 'Отдельные материалы курсов с полным текстом и привязкой к программе.',
  },
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <p className="hero__eyebrow">Flastify · учебная платформа</p>
        <h1 className="hero__title">
          Знания, собранные
          <br />
          <span className="hero__accent">по полочкам</span>
        </h1>
        <p className="hero__lead">
          Витрина данных REST API: участники создают курсы, курсы наполняются
          уроками. Всё связано и доступно в пару кликов.
        </p>
        <div className="hero__actions">
          <Link to="/courses" className="btn btn--primary">
            Смотреть курсы
          </Link>
          <Link to="/users" className="btn btn--ghost">
            Участники
          </Link>
        </div>
      </section>

      <section className="tiles">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="tile">
            <span className="tile__index">{card.index}</span>
            <h2 className="tile__title">{card.title}</h2>
            <p className="tile__text">{card.text}</p>
            <span className="tile__cta">Открыть →</span>
          </Link>
        ))}
      </section>
    </div>
  )
}
