import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
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
