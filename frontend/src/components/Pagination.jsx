// Строит список элементов для отрисовки: номера страниц и метки многоточий.
// Всегда показываем первую и последнюю страницы, а вокруг текущей — по одному
// соседу. Разрывы между ними схлопываются в многоточие, чтобы строка
// не разрасталась при большом количестве страниц.
// Пример (current=5, total=10): [1, 'left-ellipsis', 4, 5, 6, 'right-ellipsis', 10]
function buildPages(current, total) {
  const pages = []
  const push = (p) => pages.push(p)

  // Границы «окна» вокруг текущей страницы (не выходим за пределы 1..total).
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  // Первая страница присутствует всегда.
  push(1)
  // Многоточие нужно только если между первой страницей и окном есть разрыв.
  if (left > 2) push('left-ellipsis')
  // Сами номера окна вокруг текущей страницы.
  for (let p = left; p <= right; p += 1) push(p)
  // Многоточие справа — если есть разрыв между окном и последней страницей.
  if (right < total - 1) push('right-ellipsis')
  // Последняя страница (при total === 1 её уже добавили как первую).
  if (total > 1) push(total)

  return pages
}

/**
 * Пагинация с номерами страниц.
 * @param {number} page текущая страница (с 1)
 * @param {number} totalPages всего страниц
 * @param {(page: number) => void} onChange
 */
export default function Pagination({ page, totalPages, onChange }) {
  // Если страница всего одна (или ноль) — навигация не нужна.
  if (!totalPages || totalPages <= 1) return null

  const pages = buildPages(page, totalPages)

  return (
    <nav className="pagination" aria-label="Пагинация">
      {/* Стрелка «назад»: неактивна на первой странице. */}
      <button
        type="button"
        className="pagination__btn pagination__btn--arrow"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Предыдущая страница"
      >
        ←
      </button>

      {/* Числа — кликабельные кнопки, метки многоточий — просто текст. */}
      {pages.map((p) =>
        typeof p === 'number' ? (
          <button
            key={p}
            type="button"
            className={
              p === page
                ? 'pagination__btn pagination__btn--active'
                : 'pagination__btn'
            }
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ) : (
          <span key={p} className="pagination__ellipsis">
            …
          </span>
        ),
      )}

      {/* Стрелка «вперёд»: неактивна на последней странице. */}
      <button
        type="button"
        className="pagination__btn pagination__btn--arrow"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Следующая страница"
      >
        →
      </button>
    </nav>
  )
}
