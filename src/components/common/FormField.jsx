export function FormField({ label, name, placeholder, type = 'text', required = false, as = 'input', defaultValue = '' }) {
  const Field = as
  return (
    <label className="form-field">
      <span>{label}{required && <span className="required-mark"> *</span>}</span>
      <Field name={name} type={as === 'input' ? type : undefined} placeholder={placeholder} required={required} defaultValue={defaultValue} rows={as === 'textarea' ? 4 : undefined} />
    </label>
  )
}
