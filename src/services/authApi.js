const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function apiRequest(path, { token, method = 'GET', body } = {}) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new Error('Unable to connect to the server. Please try again.')
  }

  let data
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    const error = new Error(data.message || getStatusMessage(response.status))
    error.status = response.status
    throw error
  }

  return data
}

function getStatusMessage(status) {
  const messages = {
    401: 'Authentication required. Please log in again.',
    403: 'You are not authorized to do that.',
    404: 'The requested chat could not be found.',
    409: 'This conversation already exists.',
  }

  return messages[status] || 'Something went wrong. Please try again.'
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  let data
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Unable to sign in. Please try again.')
  }

  return data
}

export async function registerUser(userDetails) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userDetails),
  })

  let data
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Unable to create your account. Please try again.')
  }

  return data
}

export function searchUsers(token, query) {
  return apiRequest(`/api/users/search?query=${encodeURIComponent(query)}`, { token })
}

export function getConversations(token) {
  return apiRequest('/api/conversations', { token })
}

export function createConversation(token, userId) {
  return apiRequest('/api/conversations', {
    token,
    method: 'POST',
    body: { userId },
  })
}

export function getMessages(token, conversationId) {
  return apiRequest(`/api/conversations/${conversationId}/messages`, { token })
}

export function sendMessage(token, conversationId, text) {
  return apiRequest(`/api/conversations/${conversationId}/messages`, {
    token,
    method: 'POST',
    body: { text },
  })
}