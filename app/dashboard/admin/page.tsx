'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'records' | 'transfers' | 'audit' | 'invites' | 'users' | 'export'

interface FinancialRecord {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
  deletedAt?: string | null
}

interface Transfer {
  id: string
  amount: number
  notes?: string
  createdAt: string
  from: { name: string; email: string }
  to: { name: string; email: string }
}

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  createdAt: string
  user: { name: string; email: string }
}

interface Invite {
  id: string
  email: string
  role: string
  expiresAt: string
  usedAt?: string | null
  createdAt: string
  creator: { name: string; email: string }
  token: string
}

interface User {
  id: string
  name: string
  email: string
  role: 'VIEWER' | 'ANALYST' | 'ADMIN'
  isActive: boolean
  balance: number
  createdAt: string
}

type StyleMap = { [key: string]: React.CSSProperties }

const S: StyleMap = {
  page: { minHeight: '100vh', background: '#0a0f1e', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif" },
  sidebar: { position: 'fixed', left: 0, top: 0, bottom: 0, width: '220px', background: 'rgba(255,255,255,0.03)', borderRight: '1px solid rgba(255,255,255,0.07)', padding: '24px 0', display: 'flex', flexDirection: 'column', zIndex: 10 },
  logo: { padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '8px' },
  logoText: { fontSize: '16px', fontWeight: 700, color: '#f1f5f9' },
  logoBadge: { fontSize: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, letterSpacing: '0.06em' },
  navBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '14px', fontWeight: 500, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' },
  navBtnActive: { color: '#f1f5f9', background: 'rgba(99,102,241,0.12)', borderLeft: '3px solid #6366f1' },
  main: { marginLeft: '220px', padding: '32px' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' },
  h2: { fontSize: '20px', fontWeight: 700, color: '#f1f5f9', marginBottom: '20px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#94a3b8' },
  input: { width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn: { padding: '10px 20px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnGreen: { padding: '10px 20px', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  btnRed: { padding: '7px 14px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  btnOutline: { padding: '7px 14px', background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '10px 14px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.07)', letterSpacing: '0.04em' },
  td: { padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', verticalAlign: 'top' },
  success: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '16px' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em' },
  filterRow: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' as const, alignItems: 'flex-end' },
}

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: 'records', label: 'Records', icon: '📋' },
  { id: 'transfers', label: 'Transfers', icon: '💸' },
  { id: 'invites', label: 'Invites', icon: '✉️' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'audit', label: 'Audit Logs', icon: '🔍' },
  { id: 'export', label: 'Export', icon: '📤' },
]

function badgeColor(v: string): React.CSSProperties {
  if (v === 'INCOME' || v === 'ADMIN' || v === 'RESTORE') return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
  if (v === 'EXPENSE' || v === 'SOFT_DELETE' || v === 'DELETE_USER') return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
  if (v === 'ANALYST' || v === 'UPDATE' || v === 'UPDATE_USER') return { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
  return { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
}

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Education', 'Salary', 'Freelance', 'Investment', 'Bonus']

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('records')
  const [name, setName] = useState('')
  const [balance, setBalance] = useState(0)

  // records
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [recMsg, setRecMsg] = useState('')
  const [recErr, setRecErr] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')

  // transfers
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [toEmail, setToEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [txNotes, setTxNotes] = useState('')
  const [txMsg, setTxMsg] = useState('')
  const [txErr, setTxErr] = useState('')
  const [txLoading, setTxLoading] = useState(false)

  // invites
  const [invites, setInvites] = useState<Invite[]>([])
  const [invEmail, setInvEmail] = useState('')
  const [invRole, setInvRole] = useState<'VIEWER' | 'ANALYST' | 'ADMIN'>('VIEWER')
  const [invMsg, setInvMsg] = useState('')
  const [invErr, setInvErr] = useState('')
  const [invLoading, setInvLoading] = useState(false)
  const [createdInviteUrl, setCreatedInviteUrl] = useState('')
  const [createdToken, setCreatedToken] = useState('')
  const [copied, setCopied] = useState(false)

  // users
  const [users, setUsers] = useState<User[]>([])
  const [userMsg, setUserMsg] = useState('')
  const [userErr, setUserErr] = useState('')

  // audit
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditEntity, setAuditEntity] = useState('')

  // export
  const [expFormat, setExpFormat] = useState<'csv' | 'json'>('csv')
  const [expType, setExpType] = useState('')
  const [expStart, setExpStart] = useState('')
  const [expEnd, setExpEnd] = useState('')
  const [expMsg, setExpMsg] = useState('')

  const getToken = () => localStorage.getItem('token') || ''
  const hdrs = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  })

  const fetchBalance = useCallback(async () => {
    const res = await fetch('/api/auth/me', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setBalance(json.data.balance ?? 0)
  }, [])

  const fetchRecords = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterType) params.set('type', filterType)
    if (filterCategory) params.set('category', filterCategory)
    if (filterStart) params.set('startDate', filterStart)
    if (filterEnd) params.set('endDate', filterEnd)
    if (showDeleted) params.set('includeDeleted', 'true')
    const res = await fetch(`/api/records?${params.toString()}`, { headers: hdrs() })
    const json = await res.json()
    if (json.success) setRecords(json.data)
    else setRecErr(json.message || 'Failed to load records')
  }, [filterType, filterCategory, filterStart, filterEnd, showDeleted])

  const fetchTransfers = useCallback(async () => {
    const res = await fetch('/api/transfers', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setTransfers(json.data)
  }, [])

  const fetchInvites = useCallback(async () => {
    const res = await fetch('/api/invites', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setInvites(json.data)
  }, [])

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/users', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setUsers(json.data)
  }, [])

  const fetchAudit = useCallback(async () => {
    const q = auditEntity ? `?entity=${auditEntity}` : ''
    const res = await fetch(`/api/audit${q}`, { headers: hdrs() })
    const json = await res.json()
    if (json.success) setAuditLogs(json.data)
  }, [auditEntity])

  useEffect(() => {
    setName(localStorage.getItem('name') || 'Admin')
    fetchBalance()
  }, [fetchBalance])

  useEffect(() => { if (tab === 'records') fetchRecords() }, [tab, fetchRecords])
  useEffect(() => { if (tab === 'transfers') { fetchTransfers(); fetchBalance() } }, [tab, fetchTransfers, fetchBalance])
  useEffect(() => { if (tab === 'invites') fetchInvites() }, [tab, fetchInvites])
  useEffect(() => { if (tab === 'users') fetchUsers() }, [tab, fetchUsers])
  useEffect(() => { if (tab === 'audit') fetchAudit() }, [tab, fetchAudit])

  async function softDelete(id: string) {
    const res = await fetch(`/api/records/${id}`, { method: 'DELETE', headers: hdrs() })
    const json = await res.json()
    if (json.success) { setRecMsg('Record deleted.'); fetchRecords() }
    else setRecErr(json.message)
  }

  async function restore(id: string) {
    const res = await fetch(`/api/records/${id}`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ _action: 'restore' }) })
    const json = await res.json()
    if (json.success) { setRecMsg('Record restored.'); fetchRecords() }
    else setRecErr(json.message)
  }

  async function sendMoney() {
    setTxMsg(''); setTxErr('')
    if (!toEmail || !amount) { setTxErr('Email and amount are required.'); return }
    setTxLoading(true)
    try {
      const res = await fetch('/api/transfers', { method: 'POST', headers: hdrs(), body: JSON.stringify({ toEmail, amount: parseFloat(amount), notes: txNotes }) })
      const json = await res.json()
      if (json.success) { setTxMsg(json.data.message); setToEmail(''); setAmount(''); setTxNotes(''); fetchTransfers(); fetchBalance() }
      else setTxErr(json.message)
    } finally { setTxLoading(false) }
  }

  async function createInvite() {
    setInvMsg(''); setInvErr(''); setCreatedInviteUrl(''); setCreatedToken('')
    if (!invEmail) { setInvErr('Email is required.'); return }
    setInvLoading(true)
    try {
      const res = await fetch('/api/invites', { method: 'POST', headers: hdrs(), body: JSON.stringify({ email: invEmail, role: invRole }) })
      const json = await res.json()
      if (json.success) {
        setInvMsg(`Invite sent to ${json.data.email}`)
        setCreatedInviteUrl(json.data.inviteUrl || '')
        setCreatedToken(json.data.token || '')
        setInvEmail('')
        fetchInvites()
      } else setInvErr(json.message)
    } finally { setInvLoading(false) }
  }

  async function copyInviteLink() {
    await navigator.clipboard.writeText(createdInviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function updateUserRole(id: string, role: string) {
    setUserMsg(''); setUserErr('')
    const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ role }) })
    const json = await res.json()
    if (json.success) { setUserMsg('Role updated.'); fetchUsers() }
    else setUserErr(json.message)
  }

  async function toggleUserActive(id: string, current: boolean) {
    setUserMsg(''); setUserErr('')
    const res = await fetch(`/api/users/${id}`, { method: 'PATCH', headers: hdrs(), body: JSON.stringify({ isActive: !current }) })
    const json = await res.json()
    if (json.success) { setUserMsg(`User ${!current ? 'activated' : 'deactivated'}.`); fetchUsers() }
    else setUserErr(json.message)
  }

  async function deleteUserById(id: string) {
    if (!confirm('Delete this user permanently?')) return
    setUserMsg(''); setUserErr('')
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: hdrs() })
    const json = await res.json()
    if (json.success) { setUserMsg('User deleted.'); fetchUsers() }
    else setUserErr(json.message)
  }

  async function handleExport() {
    setExpMsg('')
    const params = new URLSearchParams({ export: expFormat })
    if (expType) params.append('type', expType)
    if (expStart) params.append('startDate', expStart)
    if (expEnd) params.append('endDate', expEnd)
    const res = await fetch(`/api/records?${params.toString()}`, { headers: hdrs() })
    if (!res.ok) { setExpMsg('Export failed.'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `records.${expFormat}`; a.click()
    URL.revokeObjectURL(url)
    setExpMsg(`Exported as ${expFormat.toUpperCase()} successfully.`)
  }

  function logout() { localStorage.clear(); router.push('/login') }

  return (
    <div style={S.page}>
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={S.logoText}>FinanceApp</span>
            <span style={S.logoBadge}>ADMIN</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>{name}</div>
          <div style={{ marginTop: '4px', fontSize: '13px', color: '#34d399', fontWeight: 600 }}>₹{balance.toLocaleString('en-IN')}</div>
        </div>
        {NAV.map((n) => (
          <button key={n.id} style={{ ...S.navBtn, ...(tab === n.id ? S.navBtnActive : {}) }} onClick={() => setTab(n.id)}>
            <span>{n.icon}</span> {n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={{ ...S.navBtn, color: '#f87171' }} onClick={logout}>🚪 Logout</button>
      </div>

      <div style={S.main}>

        {/* RECORDS */}
        {tab === 'records' && (
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ ...S.h2, marginBottom: 0 }}>Financial Records</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8', cursor: 'pointer' }}>
                <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
                Show deleted
              </label>
            </div>
            <div style={S.filterRow}>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={S.label}>Type</label>
                <select style={S.input} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">All</option>
                  <option value="INCOME">INCOME</option>
                  <option value="EXPENSE">EXPENSE</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={S.label}>Category</label>
                <select style={S.input} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="">All</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <label style={S.label}>Start Date</label>
                <input style={S.input} type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
              </div>
              <div style={{ flex: 1, minWidth: '130px' }}>
                <label style={S.label}>End Date</label>
                <input style={S.input} type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <button style={S.btn} onClick={fetchRecords}>Filter</button>
                <button style={{ ...S.btnOutline }} onClick={() => { setFilterType(''); setFilterCategory(''); setFilterStart(''); setFilterEnd('') }}>Clear</button>
              </div>
            </div>
            {recMsg && <div style={S.success}>{recMsg}</div>}
            {recErr && <div style={S.errorBox}>{recErr}</div>}
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>{['Category', 'Type', 'Amount', 'Date', 'Notes', 'Status', 'Actions'].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} style={{ opacity: r.deletedAt ? 0.5 : 1 }}>
                      <td style={S.td}>{r.category}</td>
                      <td style={S.td}><span style={{ ...S.badge, ...badgeColor(r.type) }}>{r.type}</span></td>
                      <td style={S.td}>₹{r.amount.toLocaleString('en-IN')}</td>
                      <td style={S.td}>{new Date(r.date).toLocaleDateString()}</td>
                      <td style={S.td}>{r.notes || '—'}</td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...(r.deletedAt ? { background: 'rgba(239,68,68,0.15)', color: '#f87171' } : { background: 'rgba(16,185,129,0.15)', color: '#34d399' }) }}>
                          {r.deletedAt ? 'Deleted' : 'Active'}
                        </span>
                      </td>
                      <td style={S.td}>
                        {!r.deletedAt
                          ? <button style={S.btnRed} onClick={() => softDelete(r.id)}>Delete</button>
                          : <button style={S.btnOutline} onClick={() => restore(r.id)}>Restore</button>}
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr><td style={{ ...S.td, textAlign: 'center', color: '#64748b', padding: '32px' }} colSpan={7}>No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TRANSFERS */}
        {tab === 'transfers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={S.card}>
              <h2 style={S.h2}>Send Money</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={S.label}>Receiver Email</label>
                  <input style={S.input} type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="receiver@example.com" />
                </div>
                <div>
                  <label style={S.label}>Amount (₹)</label>
                  <input style={S.input} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" min="1" />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={S.label}>Notes (optional)</label>
                <input style={S.input} value={txNotes} onChange={(e) => setTxNotes(e.target.value)} placeholder="Payment for..." />
              </div>
              {txMsg && <div style={S.success}>{txMsg}</div>}
              {txErr && <div style={S.errorBox}>{txErr}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button style={S.btnGreen} onClick={sendMoney} disabled={txLoading}>{txLoading ? 'Sending...' : '💸 Send Money'}</button>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Balance: <strong style={{ color: '#34d399' }}>₹{balance.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>
            <div style={S.card}>
              <h2 style={S.h2}>All Transfer History</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead><tr>{['From', 'To', 'Amount', 'Notes', 'Date'].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {transfers.map((t) => (
                      <tr key={t.id}>
                        <td style={S.td}>{t.from.name}<br /><span style={{ color: '#64748b', fontSize: '12px' }}>{t.from.email}</span></td>
                        <td style={S.td}>{t.to.name}<br /><span style={{ color: '#64748b', fontSize: '12px' }}>{t.to.email}</span></td>
                        <td style={{ ...S.td, color: '#34d399', fontWeight: 600 }}>₹{t.amount.toLocaleString('en-IN')}</td>
                        <td style={S.td}>{t.notes || '—'}</td>
                        <td style={S.td}>{new Date(t.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {transfers.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#64748b' }} colSpan={5}>No transfers yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INVITES */}
        {tab === 'invites' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={S.card}>
              <h2 style={S.h2}>Create Invite</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={S.label}>Email</label>
                  <input style={S.input} type="email" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} placeholder="newuser@example.com" />
                </div>
                <div>
                  <label style={S.label}>Role</label>
                  <select style={S.input} value={invRole} onChange={(e) => setInvRole(e.target.value as 'VIEWER' | 'ANALYST' | 'ADMIN')}>
                    <option value="VIEWER">VIEWER</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              {invMsg && <div style={S.success}>{invMsg}</div>}
              {invErr && <div style={S.errorBox}>{invErr}</div>}
              {createdInviteUrl && (
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>Invite link (also sent to email):</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#818cf8', wordBreak: 'break-all', marginBottom: '10px' }}>{createdInviteUrl}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={S.btnOutline} onClick={copyInviteLink}>{copied ? '✅ Copied!' : '📋 Copy Link'}</button>
                    <button style={S.btnOutline} onClick={() => window.open(createdInviteUrl, '_blank')}>🔗 Open</button>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>Token: {createdToken.slice(0, 20)}...</div>
                </div>
              )}
              <button style={S.btn} onClick={createInvite} disabled={invLoading}>{invLoading ? 'Creating...' : '✉️ Send Invite'}</button>
            </div>
            <div style={S.card}>
              <h2 style={S.h2}>All Invites</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead><tr>{['Email', 'Role', 'Created By', 'Expires', 'Status'].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {invites.map((inv) => {
                      const expired = new Date(inv.expiresAt) < new Date()
                      const status = inv.usedAt ? 'Used' : expired ? 'Expired' : 'Active'
                      const sc: React.CSSProperties = inv.usedAt ? { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' } : expired ? { background: 'rgba(239,68,68,0.15)', color: '#f87171' } : { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
                      return (
                        <tr key={inv.id}>
                          <td style={S.td}>{inv.email}</td>
                          <td style={S.td}><span style={{ ...S.badge, ...badgeColor(inv.role) }}>{inv.role}</span></td>
                          <td style={S.td}>{inv.creator.name}</td>
                          <td style={S.td}>{new Date(inv.expiresAt).toLocaleDateString()}</td>
                          <td style={S.td}><span style={{ ...S.badge, ...sc }}>{status}</span></td>
                        </tr>
                      )
                    })}
                    {invites.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#64748b' }} colSpan={5}>No invites yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div style={S.card}>
            <h2 style={S.h2}>Manage Users</h2>
            {userMsg && <div style={S.success}>{userMsg}</div>}
            {userErr && <div style={S.errorBox}>{userErr}</div>}
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead><tr>{['Name', 'Email', 'Role', 'Balance', 'Status', 'Actions'].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={S.td}><div style={{ fontWeight: 600, color: '#f1f5f9' }}>{u.name}</div><div style={{ fontSize: '11px', color: '#64748b' }}>ID: {u.id.slice(0, 8)}...</div></td>
                      <td style={S.td}>{u.email}</td>
                      <td style={S.td}>
                        <select
                          style={{ ...S.input, width: 'auto', padding: '4px 8px', fontSize: '12px' }}
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td style={{ ...S.td, color: '#34d399', fontWeight: 600 }}>₹{u.balance.toLocaleString('en-IN')}</td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...(u.isActive ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' } : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }) }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ ...S.td, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button style={S.btnOutline} onClick={() => toggleUserActive(u.id, u.isActive)}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button style={S.btnRed} onClick={() => deleteUserById(u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#64748b' }} colSpan={6}>No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AUDIT */}
        {tab === 'audit' && (
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <h2 style={{ ...S.h2, marginBottom: 0, flex: 1 }}>Audit Logs</h2>
              <select style={{ ...S.input, width: '180px' }} value={auditEntity} onChange={(e) => setAuditEntity(e.target.value)}>
                <option value="">All Entities</option>
                <option value="FinancialRecord">FinancialRecord</option>
                <option value="Transfer">Transfer</option>
                <option value="InviteToken">InviteToken</option>
                <option value="User">User</option>
              </select>
              <button style={S.btn} onClick={fetchAudit}>Refresh</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead><tr>{['User', 'Action', 'Entity', 'Entity ID', 'Time'].map((h) => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={S.td}>{log.user.name}<br /><span style={{ color: '#64748b', fontSize: '12px' }}>{log.user.email}</span></td>
                      <td style={S.td}><span style={{ ...S.badge, ...badgeColor(log.action) }}>{log.action}</span></td>
                      <td style={S.td}>{log.entity}</td>
                      <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '12px' }}>{log.entityId.slice(0, 12)}...</td>
                      <td style={S.td}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && <tr><td style={{ ...S.td, textAlign: 'center', color: '#64748b' }} colSpan={5}>No logs found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EXPORT */}
        {tab === 'export' && (
          <div style={S.card}>
            <h2 style={S.h2}>Export Records</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '600px' }}>
              <div><label style={S.label}>Format</label><select style={S.input} value={expFormat} onChange={(e) => setExpFormat(e.target.value as 'csv' | 'json')}><option value="csv">CSV</option><option value="json">JSON</option></select></div>
              <div><label style={S.label}>Type Filter</label><select style={S.input} value={expType} onChange={(e) => setExpType(e.target.value)}><option value="">All</option><option value="INCOME">INCOME</option><option value="EXPENSE">EXPENSE</option></select></div>
              <div><label style={S.label}>Start Date</label><input style={S.input} type="date" value={expStart} onChange={(e) => setExpStart(e.target.value)} /></div>
              <div><label style={S.label}>End Date</label><input style={S.input} type="date" value={expEnd} onChange={(e) => setExpEnd(e.target.value)} /></div>
            </div>
            {expMsg && <div style={{ ...S.success, marginTop: '16px' }}>{expMsg}</div>}
            <button style={{ ...S.btnGreen, marginTop: '20px' }} onClick={handleExport}>📥 Export {expFormat.toUpperCase()}</button>
          </div>
        )}
      </div>
    </div>
  )
}


