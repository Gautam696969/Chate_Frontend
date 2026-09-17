import { useEffect, useState } from 'react'
import Login from './components/Login'
import Registration from './components/Registration'
import ChatDashboard from './components/ChatDashboard'
import { clearAuthSession, getAuthSession } from './services/authStorage'

function App() {
  const [route, setRoute] = useState(window.location.pathname)
  const [authSession, setAuthSession] = useState(getAuthSession)

  useEffect(() => {
    const handlePopState = () => setRoute(window.location.pathname)
    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextRoute) => {
    window.history.pushState({}, '', nextRoute)
    setRoute(nextRoute)
  }

  const handleLoginSuccess = () => {
    setAuthSession(getAuthSession())
    navigate('/chat')
  }

  const handleLogout = () => {
    clearAuthSession()
    setAuthSession({ token: null, user: null })
    navigate('/')
  }

  useEffect(() => {
    if (route === '/chat' && !authSession.token) {
      window.history.replaceState({}, '', '/')
    }
  }, [route, authSession.token])

  if (route === '/chat' && authSession.token) {
    return <ChatDashboard user={authSession.user} token={authSession.token} onLogout={handleLogout} />
  }

  const showRegistration = route === '/register'

  return showRegistration ? (
    <Registration onLogin={() => navigate('/')} />
  ) : (
    <Login onSignUp={() => navigate('/register')} onLoginSuccess={handleLoginSuccess} />
  )
}

export default App
