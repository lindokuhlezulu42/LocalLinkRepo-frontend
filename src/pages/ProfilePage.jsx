import { useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react'
import { CATEGORIES } from '../data/categories.js'
import { AppLink } from '../components/common/AppLink.jsx'
import { CategoryIcon } from '../components/common/CategoryIcon.jsx'
import { FormField } from '../components/common/FormField.jsx'
import { apiPost } from '../lib/api.js'

export function ProfilePage({ provider, navigate, notify }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const sendEnquiry = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    setError('')
    setSubmitting(true)
    const formData = new FormData(form)
    try {
      await apiPost(`/api/providers/${provider.id}/enquiries`, {
        name: String(formData.get('name')).trim(),
        phone: String(formData.get('phone')).trim(),
        email: String(formData.get('email')).trim() || null,
        message: String(formData.get('message')).trim(),
      })
      form.reset()
      notify('Your enquiry was sent to the provider.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }
  const phoneDigits = provider.phone.replace(/\D/g, '')
  const whatsapp = `https://wa.me/27${phoneDigits.replace(/^0/, '')}`

  return (
    <main className="profile-page">
      <div className="profile-wrap">
        <AppLink to="/browse" navigate={navigate} className="back-link"><ArrowLeft size={16} /> Back to directory</AppLink>
        <section className="profile-card profile-summary">
          <div className="profile-title-row">
            <span className={`category-icon category-icon-large ${CATEGORIES.find((item) => item.name === provider.category)?.color || 'violet'}`}>
              <CategoryIcon name={provider.category} size={26} />
            </span>
            <div className="profile-heading">
              <h1>{provider.name}</h1>
              <p><MapPin size={16} /> {provider.area}<span>·</span>{provider.category}<span>·</span>Listed by {provider.ownerName || provider.name}</p>
            </div>
            <span className="verified-badge"><BadgeCheck size={15} /> Verified</span>
          </div>
          <div className="profile-stats">
            <Stat label="Indicative price" value={provider.price || 'Contact for a quote'} />
            <Stat label="Experience" value={provider.experience || 'Experienced local provider'} />
            <Stat label="Area served" value={provider.area} />
          </div>
        </section>
        <section className="profile-card about-card">
          <h2>About this service</h2>
          <p>{provider.description}</p>
          <h3><BriefcaseBusiness size={17} /> Services offered</h3>
          <div className="service-tags">
            {(provider.services?.length ? provider.services : [provider.category]).map((service) => (
              <span key={service}><BadgeCheck size={14} /> {service}</span>
            ))}
          </div>
        </section>
        <div className="profile-columns">
          <section className="contact-card">
            <h2>Contact {provider.name}</h2>
            <p>Deal directly with the provider. Mention LocalLink so they know where you found them.</p>
            <a className="contact-line" href={`tel:${phoneDigits}`}><Phone size={18} /> {provider.phone}</a>
            <a className="contact-line" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Message on WhatsApp</a>
            <a className="contact-line" href={`mailto:${provider.email}`}><Mail size={18} /> {provider.email}</a>
            <div className="contact-trust"><ShieldCheck size={15} /> Contact details reviewed by LocalLink</div>
          </section>
          <section className="enquiry-card">
            <div className="enquiry-heading">
              <div><h2>Request a quote</h2><p>Send your details straight to this provider.</p></div>
              <MessageCircle size={22} />
            </div>
            <form className="form-stack" onSubmit={sendEnquiry}>
              <FormField label="Your name" name="name" placeholder="e.g. Nomsa M." required />
              <FormField label="Phone or WhatsApp" name="phone" placeholder="e.g. 082 123 4567" required />
              <FormField label="Email (optional)" name="email" placeholder="you@example.com" type="email" />
              <FormField label="What do you need help with?" name="message" placeholder="Describe the job, when you need it and your area." as="textarea" required />
              {error && <div className="form-error" role="alert">{error}</div>}
              <button type="submit" className="button button-primary button-full" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send enquiry'} <ArrowRight size={17} />
              </button>
            </form>
            <p className="privacy-note"><LockIcon /> Your details are shared only with this provider.</p>
          </section>
        </div>
      </div>
    </main>
  )
}

export function LockIcon() {
  return <ShieldCheck size={14} aria-hidden="true" />
}

export function Stat({ label, value }) {
  return <div className="stat-box"><p>{label}</p><strong>{value}</strong></div>
}
