let csrfTokenPromise

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch('/api/auth/csrf', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Could not establish a secure API session.')
        const result = await response.json()
        return result.token
      })
      .catch((error) => {
        csrfTokenPromise = undefined
        throw error
      })
  }
  return csrfTokenPromise
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers)
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (!['GET', 'HEAD', 'OPTIONS'].includes((options.method || 'GET').toUpperCase())) {
    headers.set('X-XSRF-TOKEN', await getCsrfToken())
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: 'same-origin',
  })

  if (response.status === 204) return null
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.message || `Request failed (${response.status}).`
    if (response.status === 403 && message.toLowerCase().includes('csrf')) {
      csrfTokenPromise = undefined
    }
    throw new Error(message)
  }
  return payload
}

export const apiGet = (path) => apiRequest(path)
export const apiPost = (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) })
export const apiPatch = (path, body) => apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) })
export const apiDelete = (path) => apiRequest(path, { method: 'DELETE' })
export const clearCsrfToken = () => { csrfTokenPromise = undefined }
