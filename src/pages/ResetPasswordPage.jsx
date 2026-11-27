import { useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeSlash, ShieldCheck } from '../icons.js'
import { AppLink } from '../components/common/AppLink.jsx'
import { apiPost } from '../lib/api.js'

function PasswordInput({ label, name, placeholder, visible, onToggle }) {
  return (
    <label className="form-field">
      <span>{label}<span className="required-mark"> *</span></span>
      <span className="password-input-wrap">
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete="new-password"
          minLength={6}
          maxLength={72}
          required
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          title={visible ? 'Hide password' : 'Show password'}
          onClick={onToggle}
        >
          {visible ? <EyeSlash size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  )
}

export function ResetPasswordPage({ navigate }) {
  const token = new URLSearchParams(window.location.search).get('token')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password'))
    if (password !== String(formData.get('confirm'))) {
      setError('The two passwords do not match.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await apiPost('/api/auth/reset-password', { token, password })
      setDone(true)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = () => setShowPassword((visible) => !visible)

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-mark"><ShieldCheck size={22} /></div>
        <p className="eyebrow">Account help</p>
        {done ? (
          <>
            <h1>Password changed</h1>
            <div className="success-panel" role="status"><ShieldCheck size={18} /><p>Your password has been updated.</p></div>
            <AppLink to="/login" navigate={navigate} className="button button-primary button-full">
              Sign in <ArrowRight size={17} />
            </AppLink>
          </>
        ) : !token ? (
          <>
            <h1>Reset link missing</h1>
            <p className="auth-subtitle">Open the link from your reset email, or request a new one.</p>
            <AppLink to="/forgot-password" navigate={navigate} className="button button-primary button-full">
              Request a reset link <ArrowRight size={17} />
            </AppLink>
          </>
        ) : (
          <>
            <h1>Choose a new password</h1>
            <p className="auth-subtitle">Use at least 6 characters. You’ll sign in with this password from now on.</p>
            {error && (
              <div className="form-error" role="alert">
                {error}{' '}
                {/expired|invalid/i.test(error) && <AppLink to="/forgot-password" navigate={navigate}>Request a new link</AppLink>}
              </div>
            )}
            <form className="form-stack" onSubmit={submit}>
              <PasswordInput label="New password" name="password" placeholder="At least 6 characters" visible={showPassword} onToggle={toggle} />
              <PasswordInput label="Confirm new password" name="confirm" placeholder="Type it again" visible={showPassword} onToggle={toggle} />
              <button type="submit" className="button button-primary button-full" disabled={saving}>
                {saving ? 'Saving…' : 'Save new password'} <ArrowRight size={17} />
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
