import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../auth.jsx'

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
 * Модалка с двумя режимами: вход и регистрация.
 */
export default function AuthModal({ open, onClose }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const emailRef = useRef(null)

  // Сброс состояния при каждом открытии.
  useEffect(() => {
    if (!open) return
    setMode('login')
    setEmail('')
    setFullName('')
    setError(null)
    setSubmitting(false)
  }, [open])

  // Закрытие по Escape + автофокус.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    emailRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const switchMode = (next) => {
    setMode(next)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(email)
      } else {
        await register({ email, fullName })
      }
      onClose()
    } catch (err) {
      setError(extractMessage(err))
      setSubmitting(false)
    }
  }

  const isLogin = mode === 'login'

  return createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? 'Вход' : 'Регистрация'}
      onMouseDown={onClose}
    >
      <div className="modal__dialog" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 className="modal__title">{isLogin ? 'Вход' : 'Регистрация'}</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="authtabs">
          <button
            type="button"
            className={
              isLogin ? 'authtabs__tab authtabs__tab--active' : 'authtabs__tab'
            }
            onClick={() => switchMode('login')}
          >
            Вход
          </button>
          <button
            type="button"
            className={
              !isLogin ? 'authtabs__tab authtabs__tab--active' : 'authtabs__tab'
            }
            onClick={() => switchMode('register')}
          >
            Регистрация
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <label className="field">
              <span className="field__label">Полное имя</span>
              <input
                className="field__input"
                type="text"
                value={fullName}
                placeholder="Иван Иванов"
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
          )}

          <label className="field">
            <span className="field__label">
              Email<span className="field__req"> *</span>
            </span>
            <input
              ref={emailRef}
              className="field__input"
              type="email"
              value={email}
              placeholder="name@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

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
              {submitting
                ? 'Подождите…'
                : isLogin
                  ? 'Войти'
                  : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
