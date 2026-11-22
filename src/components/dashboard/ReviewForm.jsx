import { useState } from 'react'
import { Star } from '../../icons.js'
import { apiPost } from '../../lib/api.js'

export function ReviewForm({ enquiry, onSubmitted }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submitReview = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await apiPost(`/api/enquiries/${enquiry.id}/review`, { rating, comment: comment.trim() })
      onSubmitted(enquiry.id)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (enquiry.reviewed) {
    return <p className="review-submitted">Thanks for sharing your experience.</p>
  }

  return (
    <form className="review-form" onSubmit={submitReview}>
      <strong>How was your completed service?</strong>
      <div className="review-rating" role="group" aria-label="Choose a rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={value <= rating ? 'selected' : ''}
            aria-label={`${value} star${value === 1 ? '' : 's'}`}
            aria-pressed={rating === value}
            onClick={() => setRating(value)}
          >
            <Star size={19} />
          </button>
        ))}
      </div>
      <label className="form-field">
        <span>Your review</span>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={3} required placeholder="Share a few details about your experience." />
      </label>
      {error && <div className="form-error" role="alert">{error}</div>}
      <button type="submit" className="button button-secondary" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit verified review'}
      </button>
    </form>
  )
}
