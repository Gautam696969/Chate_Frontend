import { useEffect, useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
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
    toast.success('Login successful')
    navigate('/chat')
  }

  const handleLogout = () => {
    clearAuthSession()
    setAuthSession({ token: null, user: null })
    toast.success('You have been logged out')
    navigate('/')
  }

  useEffect(() => {
    if (route === '/chat' && !authSession.token) {
      window.history.replaceState({}, '', '/')
    }
  }, [route, authSession.token])

  const showRegistration = route === '/register'
  const page = route === '/chat' && authSession.token
    ? <ChatDashboard user={authSession.user} token={authSession.token} onLogout={handleLogout} />
    : showRegistration
      ? <Registration onLogin={() => navigate('/')} />
      : <Login onSignUp={() => navigate('/register')} onLoginSuccess={handleLoginSuccess} />

  return <>
    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    {page}
  </>
}

export default App
