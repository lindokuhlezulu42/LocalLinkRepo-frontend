import { useEffect, useId, useRef, useState } from 'react'
import { AlertCircle, X } from '../../icons.js'

const MAX_LENGTH = 500

// Styled replacement for window.prompt(): asks for a required reason before a
// (usually destructive) action. Shares the look of ConfirmationDialog.
export function ReasonDialog({
  title,
  message,
  label = 'Reason',
  placeholder = '',
  hint = '',
  confirmLabel = 'Submit',
  danger = false,
  onConfirm,
  onClose,
}) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const textarea = useRef(null)
  const fieldId = useId()

  useEffect(() => {
    textarea.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [busy, onClose])

  const trimmed = reason.trim()

  const submit = async (event) => {
    event.preventDefault()
    if (!trimmed) {
      setError('Please enter a reason.')
      textarea.current?.focus()
      return
    }
    setBusy(true)
    setError('')
    try {
      const result = await onConfirm(trimmed)
      if (result?.error) setError(result.error)
      else onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="confirmation-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) onClose()
    }}>
      <form className="confirmation-dialog reason-dialog" role="dialog" aria-modal="true" aria-labelledby={`${fieldId}-title`} aria-describedby={`${fieldId}-message`} onSubmit={submit} noValidate>
        <button type="button" className="confirmation-close" aria-label="Close dialog" onClick={onClose} disabled={busy}><X size={17} /></button>
        <span className={`confirmation-icon ${danger ? 'danger' : ''}`}><AlertCircle size={23} /></span>
        <p className="eyebrow">Action required</p>
        <h2 id={`${fieldId}-title`}>{title}</h2>
        <p id={`${fieldId}-message`}>{message}</p>

        <div className={`reason-field ${error ? 'has-error' : ''}`}>
          <div className="reason-field-header">
            <label htmlFor={fieldId}>{label} <span aria-hidden="true">*</span></label>
            <span className={`reason-count ${reason.length >= MAX_LENGTH ? 'at-limit' : ''}`} aria-live="polite">
              {reason.length}/{MAX_LENGTH}
            </span>
          </div>
          <textarea
            id={fieldId}
            ref={textarea}
            value={reason}
            maxLength={MAX_LENGTH}
            rows={4}
            placeholder={placeholder}
            disabled={busy}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            onChange={(event) => {
              setReason(event.target.value)
              if (error) setError('')
            }}
          />
          {error
            ? <p id={`${fieldId}-error`} className="reason-error" role="alert">{error}</p>
            : hint && <p id={`${fieldId}-hint`} className="reason-hint">{hint}</p>}
        </div>

        <div className="confirmation-actions">
          <button type="button" className="button button-secondary" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className={`button ${danger ? 'button-danger' : 'button-primary'}`} disabled={busy || !trimmed}>
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
