import './Button.css'

function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'medium',
    icon,
    disabled = false,
    className = ''
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} btn-${size} ${className}`}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            {children}
        </button>
    )
}

export default Button
