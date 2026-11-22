import { useEffect, useState } from 'react'
import { CalendarDays, Check, X } from '../../icons.js'
import { apiGet, apiPatch } from '../../lib/api.js'
import { DashboardHeading } from './DashboardHeading.jsx'
import { StatusBadge } from './StatusBadge.jsx'

export function BookingCenter({ user, notify }) {
  const isProvider = user.role === 'provider'
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    let active = true
    apiGet(isProvider ? '/api/bookings/provider' : '/api/bookings/mine')
      .then((items) => {
        if (active) setBookings(items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [isProvider])

  const updateStatus = async (booking, status) => {
    setUpdatingId(booking.id)
    setError('')
    try {
      const updated = await apiPatch(`/api/bookings/${booking.id}/status`, { status })
      setBookings((current) => current.map((item) => item.id === booking.id ? updated : item))
      notify(status === 'confirmed' ? 'Booking confirmed.' : 'Booking declined.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div>
      <DashboardHeading eyebrow="Appointments" title={isProvider ? 'Booking requests' : 'My bookings'} text={isProvider ? 'Confirm or decline requests for your available appointment times.' : 'Check the status of your appointment requests.'} />
      {error && <div className="form-error" role="alert">{error}</div>}
      {loading ? <p className="panel-empty">Loading bookings…</p> : bookings.length ? (
        <div className="booking-list">
          {bookings.map((booking) => (
            <article className="booking-item" key={booking.id}>
              <div className="booking-item-heading">
                <div><CalendarDays size={18} /><strong>{new Date(booking.startAt).toLocaleString()}</strong></div>
                <StatusBadge status={booking.status} />
              </div>
              <p>{isProvider ? `Requested by ${booking.residentName}` : `Service: ${booking.providerName}`}</p>
              <p className="booking-message">{booking.message}</p>
              <span className="booking-end-time">Until {new Date(booking.endAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
              {isProvider && booking.status === 'pending' && (
                <div className="booking-actions">
                  <button type="button" className="button button-primary" onClick={() => updateStatus(booking, 'confirmed')} disabled={updatingId === booking.id}><Check size={15} /> Confirm</button>
                  <button type="button" className="button button-secondary" onClick={() => updateStatus(booking, 'declined')} disabled={updatingId === booking.id}><X size={15} /> Decline</button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : <p className="panel-empty">{isProvider ? 'You have no appointment requests yet.' : 'You have not requested an appointment yet.'}</p>}
    </div>
  )
}
