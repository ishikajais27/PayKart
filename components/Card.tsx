interface CardProps {
  title: string
  value: string | number
  color?: string
}

export default function Card({ title, value, color = '#2563eb' }: CardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderLeft: `4px solid ${color}`,
      }}
    >
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
        {title}
      </p>
      <p style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
        {value}
      </p>
    </div>
  )
}
