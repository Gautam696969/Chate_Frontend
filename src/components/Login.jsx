import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, MessageCircle, Sparkles } from 'lucide-react'
import { loginUser } from '../services/authApi'
import { saveAuthSession } from '../services/authStorage'

function Login({ onSignUp, onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter your email address.' })
      return
    }

    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password.' })
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const data = await loginUser({ email: email.trim(), password })
      const user = data.user || {
        id: data.id,
        name: data.name,
        email: data.email,
        profileImage: data.profileImage,
      }

      saveAuthSession(data.token, user)
      setMessage({ type: 'success', text: 'Login successful.' })
      onLoginSuccess()
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-primary px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute left-4 top-4 flex items-center gap-2 sm:left-6 sm:top-6" aria-label="Chate">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-[13px] bg-accent shadow-lg shadow-indigo-900/30">
          <MessageCircle className="h-5 w-5 fill-white text-white" strokeWidth={2.2} />
          <Sparkles className="absolute -right-0.5 -top-0.5 h-3 w-3 fill-amber-300 text-amber-300" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-bold tracking-tight text-text-primary">Chate</span>
      </div>
      <div className="w-full max-w-md bg-bg-card rounded-2xl shadow-2xl p-6 sm:p-8 border border-border-input">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1 sm:mb-2">Welcome Back</h1>
          <p className="text-text-secondary text-sm sm:text-base">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 sm:w-5 sm:h-5" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-bg-input border border-border-input rounded-xl text-text-primary placeholder:text-text-muted text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4 sm:w-5 sm:h-5" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-bg-input border border-border-input rounded-xl text-text-primary placeholder:text-text-muted text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-border-input bg-bg-input text-accent focus:ring-accent" />
              <span className="text-text-secondary">Remember me</span>
            </label>
            <a href="#" className="text-accent hover:text-accent-hover font-medium">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover active:bg-indigo-800 transition duration-200 shadow-lg shadow-indigo-900/30 text-sm sm:text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          {message.text && (
            <p
              role="alert"
              className={`text-center text-sm ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}
            >
              {message.text}
            </p>
          )}
        </form>

        <div className="mt-6">
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-input" />
            </div>
            <span className="relative bg-bg-card px-4 text-sm text-text-muted">or continue with</span>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border-input rounded-xl hover:bg-bg-input transition text-text-secondary">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="hidden sm:inline">Google</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border-input rounded-xl hover:bg-bg-input transition text-text-secondary">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onSignUp} className="text-accent font-medium hover:text-accent-hover">
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
