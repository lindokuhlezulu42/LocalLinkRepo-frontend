import { ArrowLeft, Mail } from '../icons.js'
import { AppLink } from '../components/common/AppLink.jsx'

export function ForgotPasswordPage({ navigate }) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-mark"><Mail size={22} /></div>
        <p className="eyebrow">Account help</p>
        <h1>Password recovery</h1>
        <p className="auth-subtitle">
          Email delivery is not configured for this project yet. Contact your LocalLink administrator to recover access.
        </p>
        <AppLink to="/login" navigate={navigate} className="back-link auth-back">
          <ArrowLeft size={16} /> Back to sign in
        </AppLink>
      </div>
    </main>
  )
}
