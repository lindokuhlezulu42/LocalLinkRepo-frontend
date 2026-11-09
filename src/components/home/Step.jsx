export function Step({ number, title, text }) {
  return (
    <article className="step-card">
      <span className="step-number">{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}
