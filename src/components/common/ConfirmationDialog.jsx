import { useEffect, useRef, useState } from 'react'
import { AlertCircle, X } from '../../icons.js'

export function ConfirmationDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onClose,
}) {
  const [busy, setBusy] = useState(false)
  const cancelButton = useRef(null)

  useEffect(() => {
    cancelButton.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [busy, onClose])

  const confirm = async () => {
    setBusy(true)
    try {
      const completed = await onConfirm()
      if (completed !== false) onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="confirmation-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onClose()
    }}>
      <section className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message">
        <button type="button" className="confirmation-close" aria-label="Close dialog" onClick={onClose} disabled={busy}><X size={17} /></button>
        <span className={`confirmation-icon ${danger ? 'danger' : ''}`}><AlertCircle size={23} /></span>
        <p className="eyebrow">Please confirm</p>
        <h2 id="confirmation-title">{title}</h2>
        <p id="confirmation-message">{message}</p>
        <div className="confirmation-actions">
          <button ref={cancelButton} type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="button" className={`button ${danger ? 'button-danger' : 'button-primary'}`} onClick={confirm} disabled={busy}>
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
