import { useState } from 'react'
import { ArrowRight, BriefcaseBusiness, Eye, EyeSlash, House, ShieldCheck } from '../icons.js'
import { AppLink } from '../components/common/AppLink.jsx'
import { FormField } from '../components/common/FormField.jsx'
import { apiPost } from '../lib/api.js'

export function AuthPage({ mode, onAuthenticated, navigate, notify }) {
  const isRegister = mode === 'register'
  const [role, setRole] = useState('provider')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email')).trim().toLowerCase()
    const password = String(formData.get('password'))
    try {
      if (isRegister) {
        await apiPost('/api/auth/register', {
          name: String(formData.get('name')).trim(),
          email,
          password,
          role,
        })
        notify('Check your email for a verification link.')
        navigate('/verify-email')
      } else {
        const account = await apiPost('/api/auth/login', { email, password })
        onAuthenticated(account)
        notify('You are signed in.')
        navigate('/dashboard')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-mark auth-logo-mark"><img src="/locallink-mark.png" alt="" /></div>
        <p className="eyebrow">{isRegister ? 'Join the community' : 'Welcome back'}</p>
        <h1>{isRegister ? 'Create your account' : 'Sign in to LocalLink'}</h1>
        <p className="auth-subtitle">{isRegister ? 'Get your services in front of people nearby.' : 'Manage your services and keep up with enquiries.'}</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form className="form-stack" onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <FormField label="Your name" name="name" placeholder="e.g. Thabo Mokoena" required />
              <div className="role-picker">
                <span className="field-label">I’m joining as</span>
                <div className="role-options">
                  <button type="button" className={`role-option ${role === 'provider' ? 'selected' : ''}`} onClick={() => setRole('provider')}>
                    <BriefcaseBusiness size={17} /><strong>Service provider</strong><span>List a service and meet new customers</span>
                  </button>
                  <button type="button" className={`role-option ${role === 'resident' ? 'selected' : ''}`} onClick={() => setRole('resident')}>
                    <House size={17} /><strong>Resident</strong><span>Keep track of enquiries you send</span>
                  </button>
                </div>
              </div>
            </>
          )}
          <FormField label="Email address" name="email" type="email" placeholder="you@example.com" required />
          <label className="form-field">
            <span>Password</span>
            <span className="password-input-wrap">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                minLength={isRegister ? 6 : undefined}
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeSlash size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {!isRegister && <AppLink to="/forgot-password" navigate={navigate} className="forgot-link">Forgot password?</AppLink>}
          <button type="submit" className="button button-primary button-full" disabled={submitting}>
            {submitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={17} />
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to LocalLink?'}{' '}
          <AppLink to={isRegister ? '/login' : '/register'} navigate={navigate}>{isRegister ? 'Sign in' : 'Create an account'}</AppLink>
        </p>
        <p className="local-demo-note"><ShieldCheck size={14} /> Your account is stored securely by the LocalLink server.</p>
      </div>
    </main>
  )
}
