'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'records' | 'transfers' | 'export'

interface FinancialRecord {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
}

interface Transfer {
  id: string
  amount: number
  notes?: string
  createdAt: string
  from: { id: string; name: string; email: string }
  to: { id: string; name: string; email: string }
}

type StyleMap = { [key: string]: React.CSSProperties }

const S: StyleMap = {
  page: {
    minHeight: '100vh',
    background: '#0a0f1e',
    color: '#e2e8f0',
    fontFamily: "'DM Sans', sans-serif",
  },
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '220px',
    background: 'rgba(255,255,255,0.03)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
  },
  logo: {
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    marginBottom: '8px',
  },
  logoText: { fontSize: '16px', fontWeight: 700, color: '#f1f5f9' },
  logoBadge: {
    fontSize: '10px',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#818cf8',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 600,
    letterSpacing: '0.06em',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  navBtnActive: {
    color: '#f1f5f9',
    background: 'rgba(99,102,241,0.12)',
    borderLeft: '3px solid #6366f1',
  },
  main: { marginLeft: '220px', padding: '32px' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  h2: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btnGreen: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 600,
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    letterSpacing: '0.04em',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#cbd5e1',
    verticalAlign: 'top',
  },
  success: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
    color: '#34d399',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
}

const NAV = [
  { id: 'records', label: 'Records', icon: '📋' },
  { id: 'transfers', label: 'Transfers', icon: '💸' },
  { id: 'export', label: 'Export', icon: '📤' },
]

export default function AnalystDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('records')
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [balance, setBalance] = useState(0)

  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])

  const [toEmail, setToEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [txNotes, setTxNotes] = useState('')
  const [txMsg, setTxMsg] = useState('')
  const [txErr, setTxErr] = useState('')
  const [txLoading, setTxLoading] = useState(false)

  const [expFormat, setExpFormat] = useState<'csv' | 'json'>('csv')
  const [expType, setExpType] = useState('')
  const [expStart, setExpStart] = useState('')
  const [expEnd, setExpEnd] = useState('')
  const [expMsg, setExpMsg] = useState('')

  const getToken = () => localStorage.getItem('token') || ''
  const hdrs = (): { [key: string]: string } => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  })

  const fetchBalance = useCallback(async () => {
    const res = await fetch('/api/auth/me', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setBalance(json.data.balance ?? 0)
  }, [])

  const fetchRecords = useCallback(async () => {
    const res = await fetch('/api/records', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setRecords(json.data)
  }, [])

  const fetchTransfers = useCallback(async () => {
    const res = await fetch('/api/transfers', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setTransfers(json.data)
  }, [])

  useEffect(() => {
    setName(localStorage.getItem('name') || '')
    setUserId(localStorage.getItem('userId') || '')
    fetchBalance()
  }, [fetchBalance])

  useEffect(() => {
    if (tab === 'records') fetchRecords()
  }, [tab, fetchRecords])
  useEffect(() => {
    if (tab === 'transfers') {
      fetchTransfers()
      fetchBalance()
    }
  }, [tab, fetchTransfers, fetchBalance])

  async function sendMoney() {
    setTxMsg('')
    setTxErr('')
    if (!toEmail || !amount) {
      setTxErr('Email and amount required.')
      return
    }
    setTxLoading(true)
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          toEmail,
          amount: parseFloat(amount),
          notes: txNotes,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setTxMsg(json.data.message)
        setToEmail('')
        setAmount('')
        setTxNotes('')
        fetchTransfers()
        fetchBalance()
      } else setTxErr(json.message)
    } finally {
      setTxLoading(false)
    }
  }

  async function handleExport() {
    setExpMsg('')
    const params = new URLSearchParams({ export: expFormat })
    if (expType) params.append('type', expType)
    if (expStart) params.append('startDate', expStart)
    if (expEnd) params.append('endDate', expEnd)
    const res = await fetch(`/api/records?${params.toString()}`, {
      headers: hdrs(),
    })
    if (!res.ok) {
      setExpMsg('Export failed.')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `records.${expFormat}`
    a.click()
    URL.revokeObjectURL(url)
    setExpMsg('Exported successfully.')
  }

  function logout() {
    localStorage.clear()
    router.push('/login')
  }

  const typeColor = (t: string): React.CSSProperties =>
    t === 'INCOME'
      ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
      : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }

  return (
    <div style={S.page}>
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={S.logoText}>FinanceApp</span>
            <span style={S.logoBadge}>ANALYST</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
            {name}
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '13px',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            ₹{balance.toLocaleString('en-IN')}
          </div>
        </div>
        {NAV.map((n) => (
          <button
            key={n.id}
            style={{ ...S.navBtn, ...(tab === n.id ? S.navBtnActive : {}) }}
            onClick={() => setTab(n.id as Tab)}
          >
            <span>{n.icon}</span> {n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={{ ...S.navBtn, color: '#f87171' }} onClick={logout}>
          🚪 Logout
        </button>
      </div>

      <div style={S.main}>
        {tab === 'records' && (
          <div style={S.card}>
            <h2 style={S.h2}>Your Records</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Category', 'Type', 'Amount', 'Date', 'Notes'].map(
                      (h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td style={S.td}>{r.category}</td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...typeColor(r.type) }}>
                          {r.type}
                        </span>
                      </td>
                      <td style={S.td}>₹{r.amount.toLocaleString('en-IN')}</td>
                      <td style={S.td}>
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td style={S.td}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td
                        style={{
                          ...S.td,
                          textAlign: 'center',
                          color: '#64748b',
                        }}
                        colSpan={5}
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'transfers' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={S.card}>
              <h2 style={S.h2}>Send Money</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <label style={S.label}>Receiver Email</label>
                  <input
                    style={S.input}
                    type="email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="receiver@example.com"
                  />
                </div>
                <div>
                  <label style={S.label}>Amount (₹)</label>
                  <input
                    style={S.input}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Notes (optional)</label>
                <input
                  style={S.input}
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Payment for..."
                />
              </div>
              {txMsg && <div style={S.success}>{txMsg}</div>}
              {txErr && <div style={S.errorBox}>{txErr}</div>}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
              >
                <button
                  style={S.btnGreen}
                  onClick={sendMoney}
                  disabled={txLoading}
                >
                  {txLoading ? 'Sending...' : '💸 Send Money'}
                </button>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Balance:{' '}
                  <strong style={{ color: '#34d399' }}>
                    ₹{balance.toLocaleString('en-IN')}
                  </strong>
                </span>
              </div>
            </div>

            <div style={S.card}>
              <h2 style={S.h2}>Your Transfer History</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {[
                        'Direction',
                        'Other Party',
                        'Amount',
                        'Notes',
                        'Date',
                      ].map((h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t) => {
                      const isSender = t.from.id === userId
                      return (
                        <tr key={t.id}>
                          <td style={S.td}>
                            <span
                              style={{
                                ...S.badge,
                                ...(isSender
                                  ? {
                                      background: 'rgba(239,68,68,0.15)',
                                      color: '#f87171',
                                    }
                                  : {
                                      background: 'rgba(16,185,129,0.15)',
                                      color: '#34d399',
                                    }),
                              }}
                            >
                              {isSender ? '↑ Sent' : '↓ Received'}
                            </span>
                          </td>
                          <td style={S.td}>
                            {isSender ? t.to.name : t.from.name}
                            <br />
                            <span
                              style={{ color: '#64748b', fontSize: '12px' }}
                            >
                              {isSender ? t.to.email : t.from.email}
                            </span>
                          </td>
                          <td
                            style={{
                              ...S.td,
                              color: isSender ? '#f87171' : '#34d399',
                              fontWeight: 600,
                            }}
                          >
                            {isSender ? '-' : '+'}₹
                            {t.amount.toLocaleString('en-IN')}
                          </td>
                          <td style={S.td}>{t.notes || '—'}</td>
                          <td style={S.td}>
                            {new Date(t.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                    {transfers.length === 0 && (
                      <tr>
                        <td
                          style={{
                            ...S.td,
                            textAlign: 'center',
                            color: '#64748b',
                          }}
                          colSpan={5}
                        >
                          No transfers yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'export' && (
          <div style={S.card}>
            <h2 style={S.h2}>Export Records</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                maxWidth: '600px',
              }}
            >
              <div>
                <label style={S.label}>Format</label>
                <select
                  style={S.input}
                  value={expFormat}
                  onChange={(e) =>
                    setExpFormat(e.target.value as 'csv' | 'json')
                  }
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Type Filter</label>
                <select
                  style={S.input}
                  value={expType}
                  onChange={(e) => setExpType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="INCOME">INCOME</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
              </div>
              <div>
                <label style={S.label}>Start Date</label>
                <input
                  style={S.input}
                  type="date"
                  value={expStart}
                  onChange={(e) => setExpStart(e.target.value)}
                />
              </div>
              <div>
                <label style={S.label}>End Date</label>
                <input
                  style={S.input}
                  type="date"
                  value={expEnd}
                  onChange={(e) => setExpEnd(e.target.value)}
                />
              </div>
            </div>
            {expMsg && (
              <div style={{ ...S.success, marginTop: '16px' }}>{expMsg}</div>
            )}
            <button
              style={{ ...S.btnGreen, marginTop: '20px' }}
              onClick={handleExport}
            >
              📥 Export {expFormat.toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
