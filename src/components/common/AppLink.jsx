export function AppLink({ to, navigate, className = '', children, ...props }) {
  const { onClick: onCustomClick, ...linkProps } = props
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        onCustomClick?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        navigate(to)
      }}
      {...linkProps}
    >
      {children}
    </a>
  )
}
