import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Star } from '../icons.js'
import { CATEGORIES } from '../data/categories.js'
import { AppLink } from '../components/common/AppLink.jsx'
import { CategoryIcon } from '../components/common/CategoryIcon.jsx'
import { FormField } from '../components/common/FormField.jsx'
import { apiGet, apiPost } from '../lib/api.js'

export function ProfilePage({ provider, user, navigate, notify }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviews, setReviews] = useState({ averageRating: 0, reviewCount: 0, reviews: [] })
  const [reviewsError, setReviewsError] = useState('')
  const [slots, setSlots] = useState([])
  const [slotsError, setSlotsError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [bookingSubmitting, setBookingSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    Promise.allSettled([
      apiGet(`/api/providers/${provider.id}/reviews`),
      apiGet(`/api/providers/${provider.id}/availability`),
    ]).then(([reviewResult, slotsResult]) => {
      if (!active) return
      if (reviewResult.status === 'fulfilled') setReviews(reviewResult.value)
      else setReviewsError(reviewResult.reason.message)
      if (slotsResult.status === 'fulfilled') setSlots(slotsResult.value)
      else setSlotsError(slotsResult.reason.message)
    })
    return () => { active = false }
  }, [provider.id])

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

  const requestBooking = async (event) => {
    event.preventDefault()
    if (!selectedSlot) {
      setSlotsError('Choose an available appointment time.')
      return
    }
    setSlotsError('')
    setBookingSubmitting(true)
    try {
      await apiPost(`/api/availability/${selectedSlot}/bookings`, { message: bookingMessage.trim() })
      setSlots((current) => current.filter((slot) => slot.id !== selectedSlot))
      setSelectedSlot('')
      setBookingMessage('')
      notify('Your appointment request was sent to the provider.')
    } catch (requestError) {
      setSlotsError(requestError.message)
    } finally {
      setBookingSubmitting(false)
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
            <Stat label="Verified rating" value={reviews.reviewCount ? `${reviews.averageRating.toFixed(1)} / 5 (${reviews.reviewCount})` : 'New on LocalLink'} />
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
        <section className="profile-card availability-card">
          <div className="availability-heading">
            <div><p className="eyebrow">Plan your visit</p><h2>Available appointment times</h2><p>Select a time to send a booking request. The provider will confirm it.</p></div>
            <CalendarDays size={23} />
          </div>
          {slotsError && <div className="form-error" role="alert">{slotsError}</div>}
          {slots.length ? user?.role === 'resident' ? (
            <form className="booking-request-form" onSubmit={requestBooking}>
              <div className="slot-options">
                {slots.map((slot) => (
                  <label className={`appointment-slot ${selectedSlot === slot.id ? 'selected' : ''}`} key={slot.id}>
                    <input type="radio" name="appointmentSlot" value={slot.id} checked={selectedSlot === slot.id} onChange={() => setSelectedSlot(slot.id)} />
                    <CalendarDays size={17} />
                    <span><strong>{new Date(slot.startAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong><small>{new Date(slot.startAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – {new Date(slot.endAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</small></span>
                  </label>
                ))}
              </div>
              <label className="form-field"><span>What should the provider know?</span><textarea value={bookingMessage} onChange={(event) => setBookingMessage(event.target.value)} maxLength={500} required rows={3} placeholder="Briefly describe the service you need." /></label>
              <button type="submit" className="button button-primary" disabled={bookingSubmitting}>{bookingSubmitting ? 'Sending request…' : 'Request appointment'} <ArrowRight size={16} /></button>
            </form>
          ) : user ? (
            <p className="panel-empty">Sign in with a resident account to request an appointment.</p>
          ) : (
            <p className="panel-empty"><AppLink to="/login" navigate={navigate} className="text-link">Sign in</AppLink> as a resident to request an appointment.</p>
          ) : !slotsError && <p className="panel-empty">No upcoming appointment times have been added yet. Contact the provider directly to arrange a time.</p>}
        </section>
        <section className="profile-card reviews-card">
          <div className="reviews-heading"><div><p className="eyebrow">Verified customer feedback</p><h2>Reviews</h2></div>{reviews.reviewCount > 0 && <span className="reviews-summary"><Star size={17} /> {reviews.averageRating.toFixed(1)} <span>({reviews.reviewCount})</span></span>}</div>
          {reviewsError && <div className="form-error" role="alert">{reviewsError}</div>}
          {reviews.reviews.length ? (
            <div className="review-list">
              {reviews.reviews.map((review) => (
                <article className="public-review" key={review.id}>
                  <div className="public-review-heading"><strong>{review.residentName}</strong><span>{new Date(review.createdAt).toLocaleDateString()}</span></div>
                  <div className="public-review-stars" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={15} className={index < review.rating ? 'filled' : ''} />)}</div>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          ) : !reviewsError && <p className="panel-empty">No verified reviews yet. Residents can review after a completed enquiry.</p>}
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
