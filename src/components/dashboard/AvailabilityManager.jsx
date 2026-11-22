import { useEffect, useState } from 'react'
import { CalendarDays, Plus, Trash } from '../../icons.js'
import { apiDelete, apiGet, apiPost } from '../../lib/api.js'
import { DashboardHeading } from './DashboardHeading.jsx'

export function AvailabilityManager({ providers, notify }) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('')
  const minDateTime = new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16)
  const approvedProviders = providers.filter((provider) => provider.status === 'approved')
  const activeProvider = selectedProvider || approvedProviders[0]?.id || ''

  useEffect(() => {
    let active = true
    apiGet('/api/availability/provider')
      .then((items) => {
        if (active) setSlots(items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const addSlot = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const start = new Date(String(formData.get('startAt')))
    const end = new Date(String(formData.get('endAt')))
    if (!activeProvider || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError('Choose an end time after the start time.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const slot = await apiPost(`/api/providers/${activeProvider}/availability`, {
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      })
      setSlots((current) => [...current, slot].sort((a, b) => new Date(a.startAt) - new Date(b.startAt)))
      form.reset()
      notify('Availability added.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteSlot = async (slot) => {
    setDeletingId(slot.id)
    setError('')
    try {
      await apiDelete(`/api/availability/${slot.id}`)
      setSlots((current) => current.filter((item) => item.id !== slot.id))
      notify('Availability removed.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div>
      <DashboardHeading eyebrow="Appointments" title="Manage availability" text="Add the appointment times residents can request for your approved services." />
      {error && <div className="form-error" role="alert">{error}</div>}
      {approvedProviders.length > 0 ? (
        <form className="availability-form" onSubmit={addSlot}>
          <label className="form-field">
            <span>Service listing</span>
            <select value={activeProvider} onChange={(event) => setSelectedProvider(event.target.value)} required>
              {approvedProviders.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
            </select>
          </label>
          <label className="form-field"><span>Starts</span><input type="datetime-local" name="startAt" min={minDateTime} required /></label>
          <label className="form-field"><span>Ends</span><input type="datetime-local" name="endAt" min={minDateTime} required /></label>
          <button type="submit" className="button button-primary" disabled={saving}><Plus size={16} /> {saving ? 'Adding…' : 'Add availability'}</button>
        </form>
      ) : <p className="panel-empty">You need an approved listing before you can offer appointment times.</p>}
      <h2 className="dashboard-subheading">Your appointment times</h2>
      {loading ? <p className="panel-empty">Loading availability…</p> : slots.length ? (
        <div className="availability-list">
          {slots.map((slot) => (
            <article className="availability-item" key={slot.id}>
              <CalendarDays size={18} />
              <div><strong>{new Date(slot.startAt).toLocaleString()}</strong><span>Ends {new Date(slot.endAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div>
              {slot.available && <button type="button" className="button button-secondary availability-remove" onClick={() => deleteSlot(slot)} disabled={deletingId === slot.id}><Trash size={14} /> {deletingId === slot.id ? 'Removing…' : 'Remove'}</button>}
              {!slot.available && <span className="status-badge status-pending">Requested / booked</span>}
            </article>
          ))}
        </div>
      ) : <p className="panel-empty">No appointment times yet. Add a time above to let residents book with you.</p>}
    </div>
  )
}
