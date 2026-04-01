'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.message)
        return
      }
      router.push('/dashboard/viewer')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: 'Name', type: 'text', val: name, set: setName, ph: 'John Doe' },
    {
      label: 'Email',
      type: 'email',
      val: email,
      set: setEmail,
      ph: 'you@example.com',
    },
    {
      label: 'Password',
      type: 'password',
      val: password,
      set: setPassword,
      ph: '••••••••',
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0a0f1e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '8px',
              padding: '6px 12px',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: '#34d399',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              NEW ACCOUNT
            </span>
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#f1f5f9',
              marginBottom: '8px',
            }}
          >
            Create account
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Registered users start as Viewer role
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {fields.map(({ label, type, val, set, ph }) => (
          <div key={label} style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#94a3b8',
              }}
            >
              {label}
            </label>
            <input
              type={type}
              value={val}
              onChange={(e) => set(e.target.value)}
              placeholder={ph}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ))}

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            marginTop: '8px',
            background: loading
              ? '#065f46'
              : 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
          }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#64748b',
          }}
        >
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: '#34d399',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
