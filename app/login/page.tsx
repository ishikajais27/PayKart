'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.message)
        return
      }
      localStorage.setItem('token', json.data.token)
      localStorage.setItem('role', json.data.user.role)
      localStorage.setItem('name', json.data.user.name)
      localStorage.setItem('userId', json.data.user.id)
      const role = json.data.user.role
      if (role === 'ADMIN') router.push('/dashboard/admin')
      else if (role === 'ANALYST') router.push('/dashboard/analyst')
      else router.push('/dashboard/viewer')
    } catch {
      setError('Something went wrong')
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
      }}
    >
      {/* background glow */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
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
              gap: '8px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
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
              FINANCE DASHBOARD
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
            Welcome back
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            Sign in to your account
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
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#f1f5f9',
              fontSize: '15px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#94a3b8',
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#f1f5f9',
              fontSize: '15px',
              outline: 'none',
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
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
            transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#64748b',
          }}
        >
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{
              color: '#818cf8',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
