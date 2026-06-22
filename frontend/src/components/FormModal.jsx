import { useEffect, useRef, useState } from 'react'

// Сервер возвращает ошибки в JSON (Fastify). Достаём человекочитаемое сообщение.
function extractMessage(err) {
  try {
    const parsed = JSON.parse(err.message)
    return parsed.message ?? err.message
  } catch {
    return err.message
  }
}

/**
 * Универсальная модальная форма.
 * fields: [{ name, label, type, required, placeholder, options }]
 *   type: 'text' | 'email' | 'number' | 'textarea' | 'select'
 */
export default function FormModal({
  open,
  title,
  fields,
  submitLabel = 'Сохранить',
  initialValues = {},
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const firstFieldRef = useRef(null)

  // При каждом открытии подставляем начальные значения и сбрасываем состояние.
  useEffect(() => {
    if (!open) return
    const init = {}
    for (const field of fields) {
      init[field.name] = initialValues[field.name] ?? ''
    }
    setValues(init)
    setError(null)
    setSubmitting(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Закрытие по Escape + фокус на первом поле.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    firstFieldRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const setField = (name, value) =>
    setValues((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setError(extractMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={onClose}
    >
      <div className="modal__dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {fields.map((field, index) => {
            const ref = index === 0 ? firstFieldRef : undefined
            const value = values[field.name] ?? ''

            return (
              <label className="field" key={field.name}>
                <span className="field__label">
                  {field.label}
                  {field.required && <span className="field__req"> *</span>}
                </span>

                {field.type === 'textarea' ? (
                  <textarea
                    ref={ref}
                    className="field__input field__input--area"
                    value={value}
                    rows={4}
                    placeholder={field.placeholder}
                    onChange={(e) => setField(field.name, e.target.value)}
                  />
                ) : field.type === 'select' ? (
                  <select
                    ref={ref}
                    className="field__input"
                    value={value}
                    onChange={(e) => setField(field.name, e.target.value)}
                  >
                    <option value="" disabled>
                      Выберите…
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    ref={ref}
                    className="field__input"
                    type={field.type ?? 'text'}
                    value={value}
                    placeholder={field.placeholder}
                    onChange={(e) => setField(field.name, e.target.value)}
                  />
                )}
              </label>
            )
          })}

          {error && <p className="form__error">{error}</p>}

          <div className="form__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Сохраняем…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
