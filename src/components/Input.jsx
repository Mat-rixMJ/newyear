import './Input.css'

function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    name,
    multiline = false,
    rows = 3
}) {
    const inputProps = {
        id: name,
        name,
        value,
        onChange,
        placeholder,
        required,
        className: 'input-field'
    }

    return (
        <div className="input-group">
            {label && (
                <label htmlFor={name} className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            {multiline ? (
                <textarea {...inputProps} rows={rows} />
            ) : (
                <input type={type} {...inputProps} />
            )}
        </div>
    )
}

export default Input
