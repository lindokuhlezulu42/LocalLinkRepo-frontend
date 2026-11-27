import { useState } from 'react'
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from '../icons.js'
import { AppLink } from '../components/common/AppLink.jsx'
import { FormField } from '../components/common/FormField.jsx'
import { apiPost } from '../lib/api.js'

export function ForgotPasswordPage({ navigate }) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sentMessage, setSentMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setSending(true)
    setError('')
    const formData = new FormData(event.currentTarget)
    try {
      const result = await apiPost('/api/auth/forgot-password', {
        email: String(formData.get('email')).trim(),
      })
      setSentMessage(result.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-mark"><Mail size={22} /></div>
        <p className="eyebrow">Account help</p>
        <h1>{sentMessage ? 'Check your email' : 'Forgot your password?'}</h1>
        {sentMessage ? (
          <>
            <div className="success-panel" role="status"><ShieldCheck size={18} /><p>{sentMessage}</p></div>
            <p className="auth-subtitle">The link expires in 30 minutes. Didn’t get it? Wait a minute, then try again.</p>
            <button type="button" className="button button-secondary button-full" onClick={() => setSentMessage('')}>
              Send another link
            </button>
          </>
        ) : (
          <>
            <p className="auth-subtitle">Enter the email you signed up with and we’ll send you a link to choose a new password.</p>
            {error && <div className="form-error" role="alert">{error}</div>}
            <form className="form-stack" onSubmit={submit}>
              <FormField label="Email address" name="email" type="email" placeholder="you@example.com" required />
              <button type="submit" className="button button-primary button-full" disabled={sending}>
                {sending ? 'Sending…' : 'Send reset link'} <ArrowRight size={17} />
              </button>
            </form>
          </>
        )}
        <AppLink to="/login" navigate={navigate} className="back-link auth-back">
          <ArrowLeft size={16} /> Back to sign in
        </AppLink>
      </div>
    </main>
  )
}
