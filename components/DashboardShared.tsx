'use client'
import React from 'react'

interface NavProps {
  name: string
  role: string
  roleColor: string
  roleBg: string
  roleBorder: string
  onLogout: () => void
}

export function Nav({
  name,
  role,
  roleColor,
  roleBg,
  roleBorder,
  onLogout,
}: NavProps) {
  return (
    <nav
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#f1f5f9',
          letterSpacing: '0.01em',
        }}
      >
        💹 Finance Dashboard
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '14px', color: '#64748b' }}>{name}</span>
        <span
          style={{
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            background: roleBg,
            color: roleColor,
            border: `1px solid ${roleBorder}`,
          }}
        >
          {role}
        </span>
        <button
          onClick={onLogout}
          style={{
            padding: '8px 16px',
            background: 'rgba(239,68,68,0.1)',
            color: '#f87171',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0f1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{ color: '#64748b', fontSize: '16px' }}>Loading...</p>
    </div>
  )
}

interface Record {
  id: string
  amount: number
  type: string
  category: string
  date: string
  notes?: string
}

export function RecordsTable({
  records,
  loading,
}: {
  records: Record[]
  loading: boolean
}) {
  const s = styles()
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <p style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Loading...
        </p>
      ) : records.length === 0 ? (
        <p style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          No records found
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Date', 'Type', 'Category', 'Amount', 'Notes'].map((h) => (
                <th key={h} style={s.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td style={s.td}>{new Date(r.date).toLocaleDateString()}</td>
                <td style={s.td}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background:
                        r.type === 'INCOME'
                          ? 'rgba(16,185,129,0.15)'
                          : 'rgba(239,68,68,0.15)',
                      color: r.type === 'INCOME' ? '#34d399' : '#f87171',
                    }}
                  >
                    {r.type}
                  </span>
                </td>
                <td style={s.td}>{r.category}</td>
                <td
                  style={{
                    ...s.td,
                    fontWeight: 700,
                    color: r.type === 'INCOME' ? '#34d399' : '#f87171',
                    fontFamily: 'monospace',
                  }}
                >
                  ₹{r.amount.toLocaleString()}
                </td>
                <td style={{ ...s.td, color: '#64748b' }}>{r.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export function styles() {
  return {
    page: {
      minHeight: '100vh',
      background: '#0a0f1e',
      fontFamily: "'DM Sans', sans-serif",
    } as React.CSSProperties,
    main: {
      padding: '32px',
      maxWidth: '1200px',
      margin: '0 auto',
    } as React.CSSProperties,
    header: { marginBottom: '28px' } as React.CSSProperties,
    title: {
      fontSize: '26px',
      fontWeight: 700,
      color: '#f1f5f9',
      marginBottom: '4px',
    } as React.CSSProperties,
    sub: { color: '#64748b', fontSize: '14px' } as React.CSSProperties,
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '28px',
    } as React.CSSProperties,
    filterBox: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      padding: '20px 24px',
      marginBottom: '24px',
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap' as const,
      alignItems: 'flex-end',
    } as React.CSSProperties,
    filterLabel: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: 500,
      display: 'block',
      marginBottom: '6px',
    } as React.CSSProperties,
    select: {
      padding: '9px 14px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#f1f5f9',
      outline: 'none',
      cursor: 'pointer',
    } as React.CSSProperties,
    input: {
      padding: '9px 14px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#f1f5f9',
      outline: 'none',
    } as React.CSSProperties,
    filterBtn: {
      padding: '9px 20px',
      background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500,
    } as React.CSSProperties,
    resetBtn: {
      padding: '9px 20px',
      background: 'rgba(255,255,255,0.06)',
      color: '#94a3b8',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
    } as React.CSSProperties,
    th: {
      padding: '14px 20px',
      textAlign: 'left' as const,
      fontSize: '12px',
      color: '#64748b',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      background: 'rgba(255,255,255,0.02)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    } as React.CSSProperties,
    td: {
      padding: '14px 20px',
      fontSize: '14px',
      color: '#cbd5e1',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    } as React.CSSProperties,
  }
}
