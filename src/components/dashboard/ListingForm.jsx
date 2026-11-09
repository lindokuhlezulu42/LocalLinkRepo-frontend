import { useState } from 'react'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { CATEGORIES } from '../../data/categories.js'
import { AppLink } from '../common/AppLink.jsx'
import { FormField } from '../common/FormField.jsx'
import { DashboardHeading } from './DashboardHeading.jsx'
import { apiPost } from '../../lib/api.js'

export function ListingForm({ navigate, notify, onCreated }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)
    const provider = {
      name: String(formData.get('businessName')).trim(),
      category: String(formData.get('category')),
      area: String(formData.get('area')).trim(),
      description: String(formData.get('description')).trim(),
      price: String(formData.get('price')).trim() || 'Quotes on request',
      experience: String(formData.get('experience')).trim() || 'Experienced local provider',
      services: String(formData.get('services')).split(',').map((item) => item.trim()).filter(Boolean),
      phone: String(formData.get('phone')).trim(),
      email: String(formData.get('email')).trim(),
    }
    provider.services = provider.services.split(',').map((item) => item.trim()).filter(Boolean)

    try {
      await apiPost('/api/providers', provider)
      await onCreated()
      notify('Your listing was submitted for review.')
      navigate('/dashboard/listings')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="listing-form-page">
      <AppLink to="/dashboard/listings" navigate={navigate} className="back-link"><ArrowLeft size={16} /> Back to my listings</AppLink>
      <DashboardHeading eyebrow="Grow your business" title="Add a service listing" text="Share a few details so your neighbours can find and contact you." />
      <div className="review-note"><ShieldCheck size={19} /><div><strong>Every listing is reviewed before it goes live.</strong><p>Your details will only appear in the public directory after approval.</p></div></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      <form className="listing-form form-stack" onSubmit={onSubmit}>
        <div className="form-grid">
          <FormField label="Business or service name" name="businessName" placeholder="e.g. Mokoena Plumbing" required />
          <label className="form-field"><span>Service category <span className="required-mark">*</span></span><select name="category" defaultValue="" required><option value="" disabled>Select a category</option>{CATEGORIES.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          <FormField label="Suburb or area served" name="area" placeholder="e.g. Soweto" required />
          <FormField label="Indicative price" name="price" placeholder="e.g. From R450 callout" />
          <FormField label="Years of experience" name="experience" placeholder="e.g. 8 years" />
          <FormField label="Phone or WhatsApp" name="phone" placeholder="e.g. 082 123 4567" required />
          <FormField label="Contact email" name="email" type="email" placeholder="you@example.com" required />
          <FormField label="Services offered" name="services" placeholder="Separate services with commas" required />
        </div>
        <FormField label="About your service" name="description" placeholder="Tell people what you do, where you work and what makes your service reliable." as="textarea" required />
        <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => navigate('/dashboard/listings')}>Cancel</button><button type="submit" className="button button-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit for review'} <ArrowRight size={16} /></button></div>
        <p className="local-demo-note"><ShieldCheck size={14} /> New listings are saved on the server and reviewed before publication.</p>
      </form>
    </div>
  )
}
