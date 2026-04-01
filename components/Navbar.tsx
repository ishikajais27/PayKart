'use client'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  role: string
  name: string
}

export default function Navbar({ role, name }: NavbarProps) {
  const router = useRouter()

  function logout() {
    localStorage.clear()
    router.push('/login')
  }

  return (
    <nav
      style={{
        background: '#1e293b',
        color: '#fff',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '18px' }}>Finance Dashboard</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '14px', color: '#94a3b8' }}>
          {name} — <strong style={{ color: '#38bdf8' }}>{role}</strong>
        </span>
        <button
          onClick={logout}
          style={{
            padding: '6px 14px',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
