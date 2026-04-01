interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'danger' | 'secondary'
  fullWidth?: boolean
  disabled?: boolean
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  disabled = false,
}: ButtonProps) {
  const colors = {
    primary: { bg: '#2563eb', hover: '#1d4ed8' },
    danger: { bg: '#dc2626', hover: '#b91c1c' },
    secondary: { bg: '#6b7280', hover: '#4b5563' },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: '10px 20px',
        background: disabled ? '#ccc' : colors[variant].bg,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}
