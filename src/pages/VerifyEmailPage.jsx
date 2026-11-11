import { useState } from 'react'
import { ArrowRight, Mail, ShieldCheck } from '../icons.js'
import { AppLink } from '../components/common/AppLink.jsx'
import { FormField } from '../components/common/FormField.jsx'
import { apiPost } from '../lib/api.js'

export function VerifyEmailPage({ navigate }) {
  const token = new URLSearchParams(window.location.search).get('token')
  const [status, setStatus] = useState(token ? 'ready' : 'check-email')
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const verify = async (event) => {
    event.preventDefault()
    setStatus('verifying')
    setError('')
    try {
      await apiPost('/api/auth/verify-email', { token })
      setStatus('verified')
    } catch (requestError) {
      setError(requestError.message)
      setStatus('invalid')
    }
  }

  const resend = async (event) => {
    event.preventDefault()
    setResending(true)
    setError('')
    setResendMessage('')
    const formData = new FormData(event.currentTarget)
    try {
      const result = await apiPost('/api/auth/resend-verification', {
        email: String(formData.get('email')).trim(),
      })
      setResendMessage(result.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-mark"><Mail size={22} /></div>
        <p className="eyebrow">Email verification</p>
        {status === 'verifying' ? (
          <>
            <h1>Verifying your email</h1>
            <p className="auth-subtitle">Please wait while we confirm your address.</p>
          </>
        ) : status === 'verified' ? (
          <>
            <h1>Email verified</h1>
            <p className="auth-subtitle">Your address is confirmed. You can now sign in to LocalLink.</p>
            <AppLink to="/login" navigate={navigate} className="button button-primary button-full">
              Sign in <ArrowRight size={17} />
            </AppLink>
          </>
        ) : status === 'ready' ? (
          <>
            <h1>Confirm it’s you</h1>
            <p className="auth-subtitle">Select below to confirm that you own this email address. If you did not create this account, do not continue.</p>
            {error && <div className="form-error" role="alert">{error}</div>}
            <form className="form-stack" onSubmit={verify}>
              <button type="submit" className="button button-primary button-full">
                Yes, verify my email <ArrowRight size={17} />
              </button>
            </form>
            <p className="auth-switch">Not you? You can ignore this message.</p>
          </>
        ) : (
          <>
            <h1>{status === 'invalid' ? 'Link could not be verified' : 'Check your email'}</h1>
            <p className="auth-subtitle">
              {status === 'invalid'
                ? 'This verification link may have expired or already been used. Request a fresh link below.'
                : 'We sent a verification link to the address you registered. Open it to confirm it’s yours.'}
            </p>
            {error && <div className="form-error" role="alert">{error}</div>}
            {resendMessage && <div className="success-panel" role="status"><ShieldCheck size={18} /><p>{resendMessage}</p></div>}
            <form className="form-stack" onSubmit={resend}>
              <FormField label="Email address" name="email" type="email" placeholder="you@example.com" required />
              <button type="submit" className="button button-primary button-full" disabled={resending}>
                {resending ? 'Sending…' : 'Resend verification link'} <ArrowRight size={17} />
              </button>
            </form>
            <p className="auth-switch">
              <AppLink to="/login" navigate={navigate}>Back to sign in</AppLink>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
