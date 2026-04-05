'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AcceptInviteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = searchParams.get('token')
    if (t) setToken(t)
  }, [searchParams])

  async function handleAccept() {
    setError('')
    if (!token) {
      setError('No invite token found.')
      return
    }
    if (!name || name.length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/invites/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.message || 'Failed to accept invite.')
        return
      }

      const { user, token: jwtToken } = json.data
      localStorage.setItem('token', jwtToken)
      localStorage.setItem('role', user.role)
      localStorage.setItem('name', user.name)
      localStorage.setItem('userId', user.id)

      if (user.role === 'ADMIN') router.push('/dashboard/admin')
      else if (user.role === 'ANALYST') router.push('/dashboard/analyst')
      else router.push('/dashboard/viewer')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
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
          maxWidth: '440px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '8px',
              padding: '6px 12px',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                color: '#818cf8',
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              ✉️ INVITE REGISTRATION
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
            Accept Invite
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Complete your registration to join FinanceApp.
          </p>
        </div>

        {token && (
          <div
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#818cf8',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            Token: {token.slice(0, 20)}...
          </div>
        )}

        {!token && (
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#94a3b8',
              }}
            >
              Invite Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your invite token"
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
                fontFamily: 'monospace',
              }}
            />
          </div>
        )}

        {[
          {
            label: 'Full Name',
            type: 'text',
            val: name,
            set: setName,
            ph: 'John Doe',
          },
          {
            label: 'Password',
            type: 'password',
            val: password,
            set: setPassword,
            ph: '••••••••',
          },
          {
            label: 'Confirm Password',
            type: 'password',
            val: confirmPassword,
            set: setConfirmPassword,
            ph: '••••••••',
          },
        ].map(({ label, type, val, set, ph }) => (
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

        {error && (
          <div
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            marginTop: '8px',
            background: loading
              ? '#4338ca'
              : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}
        >
          {loading ? 'Creating account...' : 'Complete Registration'}
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
          <a
            href="/login"
            style={{
              color: '#818cf8',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={<div style={{ minHeight: '100vh', background: '#0a0f1e' }} />}
    >
      <AcceptInviteForm />
    </Suspense>
  )
}
