import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, MessageCircle, Sparkles, User } from 'lucide-react'
import { registerUser } from '../services/authApi'

function Registration({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!trimmedName) {
      setMessage({ type: 'error', text: 'Please enter your name.' })
      return
    }
    if (trimmedName.length < 2) {
      setMessage({ type: 'error', text: 'Name must be at least 2 characters.' })
      return
    }
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' })
      return
    }
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter a password.' })
      return
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setIsLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await registerUser({ name: trimmedName, email: trimmedEmail, password })
      setMessage({ type: 'success', text: 'Account created. Redirecting to login...' })
      window.setTimeout(onLogin, 800)
    } catch (error) {
      const errorMessage = error.message === 'Failed to fetch'
        ? 'Unable to connect to the server. Please try again.'
        : error.message
      setMessage({ type: 'error', text: errorMessage })
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

      <div className="w-full max-w-md rounded-2xl border border-border-input bg-bg-card p-6 shadow-2xl sm:p-8">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-1 text-2xl font-bold text-text-primary sm:mb-2 sm:text-3xl">Create Account</h1>
          <p className="text-sm text-text-secondary sm:text-base">Join the conversation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:h-5 sm:w-5" />
            <input
              aria-label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-border-input bg-bg-input py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent sm:py-3 sm:text-base"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:h-5 sm:w-5" />
            <input
              aria-label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border-input bg-bg-input py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent sm:py-3 sm:text-base"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:h-5 sm:w-5" />
            <input
              aria-label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-border-input bg-bg-input py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent sm:py-3 sm:text-base"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted sm:h-5 sm:w-5" />
            <input
              aria-label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-xl border border-border-input bg-bg-input py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent sm:py-3 sm:text-base"
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition duration-200 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:py-3 sm:text-base"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {message.text && (
            <p role="alert" className={`text-center text-sm ${message.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
              {message.text}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <button type="button" onClick={onLogin} className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

export default Registration