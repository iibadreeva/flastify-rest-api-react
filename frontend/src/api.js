import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const TOKEN_KEY = 'flastify.token'
const USER_KEY = 'flastify.user'

// --- Хранение сессии в localStorage ---

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const options = {
    method,
    headers: {},
  }

  // Если пользователь вошёл — прикрепляем токен ко всем запросам,
  // чтобы проходить защищённые маршруты (onRequest: authenticate).
  const token = getToken()
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`
  }

  // Content-Type ставим только при наличии тела, иначе Fastify ругается
  // на пустое тело при content-type: application/json (например, в DELETE).
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${API_URL}${path}`, options)

  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Запрос завершился ошибкой ${res.status}`)
  }

  if (res.status === 204) return null

  return res.json()
}

export async function apiGet(path) {
  return apiRequest(path)
}

export async function apiPost(path, body) {
  return apiRequest(path, { method: 'POST', body })
}

export async function apiPatch(path, body) {
  return apiRequest(path, { method: 'PATCH', body })
}

export async function apiDelete(path) {
  return apiRequest(path, { method: 'DELETE' })
}

// --- Аутентификация ---

// Вход по email. Сервер возвращает { token, user }.
export async function login(email) {
  const data = await apiPost('/tokens', { email })
  saveSession(data)
  return data
}

// Регистрация нового пользователя; сразу логинит (сервер возвращает токен).
export async function register({ email, fullName }) {
  const body = { email }
  if (fullName) body.fullName = fullName

  const data = await apiPost('/registration', body)
  saveSession(data)
  return data
}

export function logout() {
  clearSession()
}

/**
 * Загружает ВСЕ записи постранично (на сервере perPage = 2) и возвращает
 * единый массив. Нужен, например, для выпадающих списков.
 */
export function useAllItems(basePath, perPage = 2) {
  const [items, setItems] = useState([])

  useEffect(() => {
    let active = true

    ;(async () => {
      const all = []
      // Ограничиваем число итераций на случай нестандартного ответа сервера.
      for (let page = 1; page <= 200; page += 1) {
        const sep = basePath.includes('?') ? '&' : '?'
        const batch = await apiGet(`${basePath}${sep}page=${page}`)
        if (!Array.isArray(batch) || batch.length === 0) break
        all.push(...batch)
        if (batch.length < perPage) break
      }
      if (active) setItems(all)
    })().catch(() => {
      if (active) setItems([])
    })

    return () => {
      active = false
    }
  }, [basePath, perPage])

  return items
}

/**
 * Small data-fetching hook: returns { data, error, loading } for a GET request.
 */
export function useApi(path) {
  const [state, setState] = useState({
    data: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    let active = true
    setState({ data: null, error: null, loading: true })

    apiGet(path)
      .then((data) => {
        if (active) setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (active) setState({ data: null, error, loading: false })
      })

    return () => {
      active = false
    }
  }, [path])

  return state
}
