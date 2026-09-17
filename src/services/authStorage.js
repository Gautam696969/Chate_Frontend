const TOKEN_KEY = 'authToken'
const USER_KEY = 'authUser'

export function getAuthSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  const storedUser = localStorage.getItem(USER_KEY)

  let user = null
  try {
    user = storedUser ? JSON.parse(storedUser) : null
  } catch {
    localStorage.removeItem(USER_KEY)
  }

  return { token, user }
}

export function saveAuthSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}