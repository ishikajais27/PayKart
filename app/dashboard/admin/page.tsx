'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

function Spinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <div style={{ color: '#64748b', fontSize: '14px' }}>{text}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
type Tab =
  | 'dashboard'
  | 'history'
  | 'add'
  | 'send'
  | 'users'
  | 'invites'
  | 'audit'
  | 'export'
interface User {
  id: string
  name: string
  email: string
  role: 'VIEWER' | 'ANALYST' | 'ADMIN'
  isActive: boolean
  balance: number
}
interface FinancialRecord {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
  deletedAt?: string | null
  user?: { id: string; name: string; email: string }
  userId?: string
}
interface Transfer {
  id: string
  amount: number
  notes?: string
  createdAt: string
  from: { id: string; name: string; email: string }
  to: { id: string; name: string; email: string }
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
  creator: { name: string }
}
interface Summary {
  totalIncome: number
  totalExpense: number
  netBalance: number
  categoryTotals: { category: string; total: number }[]
  recentActivity: {
    id: string
    action: string
    entity: string
    createdAt: string
    user: { name: string }
  }[]
}
interface TrendPoint {
  period: string
  income: number
  expense: number
}

const CATS = [
  'Food',
  'Travel',
  'Rent',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Utilities',
  'Education',
  'Salary',
  'Freelance',
  'Investment',
  'Bonus',
]
const DEFAULT_BUDGETS: Record<string, number> = {
  Food: 8000,
  Travel: 5000,
  Rent: 15000,
  Entertainment: 3000,
  Healthcare: 4000,
  Shopping: 5000,
  Utilities: 3000,
  Education: 6000,
}

const C = {
  bg: '#0a0f1e',
  sidebar: 'rgba(15,20,40,0.98)',
  card: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  green: '#34d399',
  red: '#f87171',
  purple: '#818cf8',
  yellow: '#fbbf24',
  text: '#f1f5f9',
  muted: '#64748b',
  sub: '#94a3b8',
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}
function pct(a: number, b: number) {
  return b === 0 ? 0 : Math.min(Math.round((a / b) * 100), 100)
}
function ac(s: string) {
  const colors = [
    '#6366f1',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
  ]
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}
function badgeColor(v: string): React.CSSProperties {
  if (['INCOME', 'ADMIN', 'RESTORE', 'Active'].includes(v))
    return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
  if (
    ['EXPENSE', 'DELETE_USER', 'SOFT_DELETE', 'Deleted', 'Inactive'].includes(v)
  )
    return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
  if (['ANALYST', 'UPDATE', 'UPDATE_USER', 'CREATE', 'Transfer In'].includes(v))
    return { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
  if (['Transfer Out', 'TRANSFER'].includes(v))
    return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
  return { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: C.bg,
    color: C.text,
    fontFamily: "'Inter',system-ui,sans-serif",
    display: 'flex',
  },
  sidebar: {
    width: '240px',
    minHeight: '100vh',
    background: C.sidebar,
    borderRight: `1px solid ${C.border}`,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 20,
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '28px 32px',
    minHeight: '100vh',
  },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    padding: '24px',
  },
  btn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnGreen: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnRed: {
    padding: '6px 14px',
    background: 'rgba(239,68,68,0.12)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnOutline: {
    padding: '6px 14px',
    background: 'rgba(99,102,241,0.1)',
    color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${C.border}`,
    borderRadius: '10px',
    color: C.text,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: C.sub,
    letterSpacing: '0.04em',
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    color: C.muted,
    fontSize: '11px',
    fontWeight: 700,
    borderBottom: `1px solid ${C.border}`,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  },
  td: {
    padding: '12px 16px',
    borderBottom: `1px solid rgba(255,255,255,0.04)`,
    color: '#cbd5e1',
    verticalAlign: 'middle',
    fontSize: '14px',
  },
  success: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    color: '#34d399',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
  },
}

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'history', label: 'History', icon: '📋' },
  { id: 'add', label: 'Add Record', icon: '➕' },
  { id: 'send', label: 'Send Money', icon: '💸' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'invites', label: 'Invites', icon: '✉️' },
  { id: 'audit', label: 'Audit Logs', icon: '🔍' },
  { id: 'export', label: 'Export', icon: '📤' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [name, setName] = useState('')
  const [balance, setBalance] = useState(0)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [trendPeriod, setTrendPeriod] = useState<'monthly' | 'weekly'>(
    'monthly',
  )
  const [budgets, setBudgets] =
    useState<Record<string, number>>(DEFAULT_BUDGETS)
  const [editBudgetCat, setEditBudgetCat] = useState<string | null>(null)
  const [editBudgetVal, setEditBudgetVal] = useState('')
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [showDeleted, setShowDeleted] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [filterUserId, setFilterUserId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showKind, setShowKind] = useState<'all' | 'records' | 'transfers'>(
    'all',
  )
  const [histMsg, setHistMsg] = useState('')
  const [histErr, setHistErr] = useState('')
  const [recAmount, setRecAmount] = useState('')
  const [recType, setRecType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [recCat, setRecCat] = useState(CATS[0])
  const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0])
  const [recNotes, setRecNotes] = useState('')
  const [recMsg, setRecMsg] = useState('')
  const [recErr, setRecErr] = useState('')
  const [recLoading, setRecLoading] = useState(false)
  const [toEmail, setToEmail] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txNotes, setTxNotes] = useState('')
  const [txMsg, setTxMsg] = useState('')
  const [txErr, setTxErr] = useState('')
  const [txLoading, setTxLoading] = useState(false)
  const [userMsg, setUserMsg] = useState('')
  const [userErr, setUserErr] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [invEmail, setInvEmail] = useState('')
  const [invRole, setInvRole] = useState<'VIEWER' | 'ANALYST' | 'ADMIN'>(
    'VIEWER',
  )
  const [invMsg, setInvMsg] = useState('')
  const [invErr, setInvErr] = useState('')
  const [invLoading, setInvLoading] = useState(false)
  const [invUrl, setInvUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [auditEntity, setAuditEntity] = useState('')
  const [expFormat, setExpFormat] = useState<'csv' | 'json'>('csv')
  const [expType, setExpType] = useState('')
  const [expStart, setExpStart] = useState('')
  const [expEnd, setExpEnd] = useState('')
  const [expMsg, setExpMsg] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [invitesLoading, setInvitesLoading] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)

  const hdrs = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  })

  const fetchBalance = useCallback(async () => {
    const r = await fetch('/api/auth/me', { headers: hdrs() })
    const j = await r.json()
    if (j.success) setBalance(j.data.balance ?? 0)
    else router.push('/login')
  }, [])

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    try {
      const [sr, tr] = await Promise.all([
        fetch(`/api/dashboard/summary`, { headers: hdrs() }),
        fetch(`/api/dashboard/trends?period=${trendPeriod}`, {
          headers: hdrs(),
        }),
      ])
      const sj = await sr.json()
      const tj = await tr.json()
      if (sj.success) setSummary(sj.data)
      if (tj.success) setTrends(Array.isArray(tj.data) ? tj.data : [])
    } finally {
      setSummaryLoading(false)
    }
  }, [trendPeriod])

  const fetchHistory = useCallback(async () => {
    setHistErr('')
    setHistoryLoading(true)
    try {
      const p = new URLSearchParams()
      if (filterType) p.set('type', filterType)
      if (filterCat) p.set('category', filterCat)
      if (filterStart) p.set('startDate', filterStart)
      if (filterEnd) p.set('endDate', filterEnd)
      if (showDeleted) p.set('includeDeleted', 'true')
      const [rr, tr] = await Promise.all([
        fetch(`/api/records?${p}`, { headers: hdrs() }),
        fetch('/api/transfers', { headers: hdrs() }),
      ])
      const rj = await rr.json()
      const tj = await tr.json()
      if (rj.success) setRecords(rj.data)
      else setHistErr(rj.message || 'Failed')
      if (tj.success) setTransfers(tj.data)
    } finally {
      setHistoryLoading(false)
    }
  }, [filterType, filterCat, filterStart, filterEnd, showDeleted])

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const r = await fetch('/api/users', { headers: hdrs() })
      const j = await r.json()
      if (j.success) setUsers(j.data)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const fetchAudit = useCallback(async () => {
    setAuditLoading(true)
    try {
      const q = auditEntity ? `?entity=${auditEntity}` : ''
      const r = await fetch(`/api/audit${q}`, { headers: hdrs() })
      const j = await r.json()
      if (j.success) setAuditLogs(j.data)
    } finally {
      setAuditLoading(false)
    }
  }, [auditEntity])

  const fetchInvites = useCallback(async () => {
    setInvitesLoading(true)
    try {
      const r = await fetch('/api/invites', { headers: hdrs() })
      const j = await r.json()
      if (j.success) setInvites(j.data)
    } finally {
      setInvitesLoading(false)
    }
  }, [])

  useEffect(() => {
    setName(localStorage.getItem('name') || 'Admin')
    fetchBalance()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (tab === 'dashboard') {
      fetchSummary()
      fetchBalance()
    }
  }, [tab, trendPeriod])
  useEffect(() => {
    if (tab === 'history') fetchHistory()
  }, [tab])
  useEffect(() => {
    if (tab === 'users') fetchUsers()
  }, [tab])
  useEffect(() => {
    if (tab === 'invites') fetchInvites()
  }, [tab])
  useEffect(() => {
    if (tab === 'audit') fetchAudit()
  }, [tab])
  useEffect(() => {
    if (tab === 'add' || tab === 'send') fetchBalance()
  }, [tab])

  const currentMonthSpend = useMemo(() => {
    const now = new Date()
    const result: Record<string, number> = {}
    records
      .filter(
        (r) =>
          r.type === 'EXPENSE' &&
          !r.deletedAt &&
          new Date(r.date).getMonth() === now.getMonth() &&
          new Date(r.date).getFullYear() === now.getFullYear(),
      )
      .forEach((r) => {
        result[r.category] = (result[r.category] || 0) + r.amount
      })
    return result
  }, [records])

  const historyRows = useMemo(() => {
    const rows: {
      id: string
      kind: 'record' | 'transfer'
      amount: number
      type: 'INCOME' | 'EXPENSE'
      category: string
      date: string
      notes?: string
      deletedAt?: string | null
      userName: string
      userEmail: string
      userId: string
    }[] = []
    if (showKind !== 'transfers') {
      records.forEach((r) => {
        const u = r.user || users.find((u) => u.id === r.userId)
        rows.push({
          id: r.id,
          kind: 'record',
          amount: r.amount,
          type: r.type,
          category: r.category,
          date: r.date,
          notes: r.notes,
          deletedAt: r.deletedAt,
          userName: u?.name ?? '—',
          userEmail: u?.email ?? '—',
          userId: r.userId ?? '',
        })
      })
    }
    if (showKind !== 'records') {
      transfers
        .filter(
          (t) =>
            (!filterUserId ||
              t.from.id === filterUserId ||
              t.to.id === filterUserId) &&
            (!filterStart || new Date(t.createdAt) >= new Date(filterStart)) &&
            (!filterEnd ||
              new Date(t.createdAt) <= new Date(filterEnd + 'T23:59:59')),
        )
        .forEach((t) => {
          if (!filterUserId || t.from.id === filterUserId)
            rows.push({
              id: `tx_out_${t.id}`,
              kind: 'transfer',
              amount: t.amount,
              type: 'EXPENSE',
              category: 'Transfer Out',
              date: t.createdAt,
              notes: `→ ${t.to.name}${t.notes ? ` — ${t.notes}` : ''}`,
              deletedAt: null,
              userName: t.from.name,
              userEmail: t.from.email,
              userId: t.from.id,
            })
          if (!filterUserId || t.to.id === filterUserId)
            rows.push({
              id: `tx_in_${t.id}`,
              kind: 'transfer',
              amount: t.amount,
              type: 'INCOME',
              category: 'Transfer In',
              date: t.createdAt,
              notes: `← ${t.from.name}${t.notes ? ` — ${t.notes}` : ''}`,
              deletedAt: null,
              userName: t.to.name,
              userEmail: t.to.email,
              userId: t.to.id,
            })
        })
    }
    let result = filterType ? rows.filter((r) => r.type === filterType) : rows
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.notes?.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.userName.toLowerCase().includes(q),
      )
    }
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [
    records,
    transfers,
    showKind,
    filterType,
    filterUserId,
    filterStart,
    filterEnd,
    searchQuery,
    users,
  ])

  const periodComparison = useMemo(() => {
    const now = new Date()
    const tm = { income: 0, expense: 0 }
    const lm = { income: 0, expense: 0 }
    records
      .filter((r) => !r.deletedAt)
      .forEach((r) => {
        const d = new Date(r.date)
        const isThis =
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        const isLast =
          d.getMonth() === (now.getMonth() - 1 + 12) % 12 &&
          d.getFullYear() ===
            (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear())
        if (isThis) {
          if (r.type === 'INCOME') tm.income += r.amount
          else tm.expense += r.amount
        }
        if (isLast) {
          if (r.type === 'INCOME') lm.income += r.amount
          else lm.expense += r.amount
        }
      })
    return { thisMonth: tm, lastMonth: lm }
  }, [records])

  async function softDelete(id: string) {
    const r = await fetch(`/api/records/${id}`, {
      method: 'DELETE',
      headers: hdrs(),
    })
    const j = await r.json()
    if (j.success) {
      setHistMsg('Record deleted.')
      fetchHistory()
    } else setHistErr(j.message)
  }

  async function restore(id: string) {
    const r = await fetch(`/api/records/${id}`, {
      method: 'PATCH',
      headers: hdrs(),
      body: JSON.stringify({ _action: 'restore' }),
    })
    const j = await r.json()
    if (j.success) {
      setHistMsg('Record restored.')
      fetchHistory()
    } else setHistErr(j.message)
  }

  async function addRecord() {
    setRecMsg('')
    setRecErr('')
    if (!recAmount || !recDate) {
      setRecErr('Amount and date required.')
      return
    }
    setRecLoading(true)
    try {
      const r = await fetch('/api/records', {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          amount: parseFloat(recAmount),
          type: recType,
          category: recCat,
          date: recDate,
          notes: recNotes,
        }),
      })
      const j = await r.json()
      if (j.success) {
        setRecMsg('✅ Record added!')
        setRecAmount('')
        setRecNotes('')
        fetchBalance()
      } else setRecErr(j.message)
    } finally {
      setRecLoading(false)
    }
  }

  async function sendMoney() {
    setTxMsg('')
    setTxErr('')
    if (!toEmail || !txAmount) {
      setTxErr('Email and amount required.')
      return
    }
    setTxLoading(true)
    try {
      const r = await fetch('/api/transfers', {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({
          toEmail,
          amount: parseFloat(txAmount),
          notes: txNotes,
        }),
      })
      const j = await r.json()
      if (j.success) {
        setTxMsg('✅ ' + j.data.message)
        setToEmail('')
        setTxAmount('')
        setTxNotes('')
        fetchBalance()
      } else setTxErr(j.message)
    } finally {
      setTxLoading(false)
    }
  }

  async function createInvite() {
    setInvMsg('')
    setInvErr('')
    setInvUrl('')
    if (!invEmail) {
      setInvErr('Email required.')
      return
    }
    setInvLoading(true)
    try {
      const r = await fetch('/api/invites', {
        method: 'POST',
        headers: hdrs(),
        body: JSON.stringify({ email: invEmail, role: invRole }),
      })
      const j = await r.json()
      if (j.success) {
        setInvMsg(`✅ Invite sent to ${j.data.email}`)
        setInvUrl(j.data.inviteUrl || '')
        setInvEmail('')
        fetchInvites()
      } else setInvErr(j.message)
    } finally {
      setInvLoading(false)
    }
  }

  async function updateUserRole(id: string, role: string) {
    const r = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: hdrs(),
      body: JSON.stringify({ role }),
    })
    const j = await r.json()
    if (j.success) {
      setUserMsg('Role updated.')
      fetchUsers()
    } else setUserErr(j.message)
  }

  async function toggleActive(id: string, cur: boolean) {
    const r = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: hdrs(),
      body: JSON.stringify({ isActive: !cur }),
    })
    const j = await r.json()
    if (j.success) {
      setUserMsg(`User ${!cur ? 'activated' : 'deactivated'}.`)
      fetchUsers()
    } else setUserErr(j.message)
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user permanently?')) return
    const r = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: hdrs(),
    })
    const j = await r.json()
    if (j.success) {
      setUserMsg('User deleted.')
      fetchUsers()
    } else setUserErr(j.message)
  }

  async function handleExport() {
    setExpMsg('')
    const p = new URLSearchParams({ export: expFormat })
    if (expType) p.append('type', expType)
    if (expStart) p.append('startDate', expStart)
    if (expEnd) p.append('endDate', expEnd)
    const r = await fetch(`/api/records?${p}`, { headers: hdrs() })
    if (!r.ok) {
      setExpMsg('Export failed.')
      return
    }
    const blob = await r.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `records.${expFormat}`
    a.click()
    URL.revokeObjectURL(url)
    setExpMsg(`✅ Exported as ${expFormat.toUpperCase()}`)
  }

  function logout() {
    localStorage.clear()
    fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          !userSearch ||
          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase()),
      ),
    [users, userSearch],
  )
  const maxTrend = Math.max(
    ...(Array.isArray(trends) ? trends : []).flatMap((t) => [
      t.income,
      t.expense,
    ]),
    1,
  )
  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length

  return (
    <div style={S.page}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div
          style={{
            padding: '24px 20px',
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: C.text,
                letterSpacing: '-0.02em',
              }}
            >
              PayKart
            </span>
            <span
              style={{
                fontSize: '10px',
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
                padding: '2px 8px',
                borderRadius: '5px',
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              ADMIN
            </span>
          </div>
          <div style={{ fontSize: '13px', color: C.muted }}>{name}</div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: C.green,
              marginTop: '4px',
            }}
          >
            {fmt(balance)}
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 20px',
                width: '100%',
                background:
                  tab === n.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                border: 'none',
                borderLeft:
                  tab === n.id ? '3px solid #6366f1' : '3px solid transparent',
                color: tab === n.id ? C.text : C.sub,
                fontSize: '14px',
                fontWeight: tab === n.id ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '16px' }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
        <div
          style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}
        >
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={S.main}>
        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: '4px',
                }}
              >
                Good{' '}
                {new Date().getHours() < 12
                  ? 'morning'
                  : new Date().getHours() < 17
                    ? 'afternoon'
                    : 'evening'}
                , {name} 👋
              </h1>
              <p style={{ color: C.muted, fontSize: '14px' }}>
                Here's what's happening across your platform today.
              </p>
            </div>

            {/* Stat cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: '16px',
              }}
            >
              {[
                {
                  label: 'Total Income',
                  value: fmt(summary?.totalIncome ?? 0),
                  color: C.green,
                  icon: '📈',
                  sub: 'All time',
                },
                {
                  label: 'Total Expenses',
                  value: fmt(summary?.totalExpense ?? 0),
                  color: C.red,
                  icon: '📉',
                  sub: 'All time',
                },
                {
                  label: 'Net Balance',
                  value: fmt(summary?.netBalance ?? 0),
                  color: (summary?.netBalance ?? 0) >= 0 ? C.green : C.red,
                  icon: '💰',
                  sub: 'Income − Expenses',
                },
                {
                  label: 'My Balance',
                  value: fmt(balance),
                  color: C.purple,
                  icon: '👤',
                  sub: 'Your wallet',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    ...S.card,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      fontSize: '48px',
                      opacity: 0.07,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {s.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: C.muted,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: C.muted,
                      marginTop: '4px',
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* This vs last month */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
              <div style={S.card}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  📅 This Month vs Last Month
                </h2>
                {(['Income', 'Expense'] as const).map((type) => {
                  const key = type.toLowerCase() as 'income' | 'expense'
                  const thisVal = periodComparison.thisMonth[key]
                  const lastVal = periodComparison.lastMonth[key]
                  const diff = thisVal - lastVal
                  const isGood = type === 'Income' ? diff >= 0 : diff <= 0
                  return (
                    <div
                      key={type}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          color: C.muted,
                          marginBottom: '8px',
                          fontWeight: 600,
                        }}
                      >
                        {type}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '10px', color: '#475569' }}>
                            This month
                          </div>
                          <div
                            style={{
                              fontSize: '18px',
                              fontWeight: 700,
                              color: type === 'Income' ? C.green : C.red,
                            }}
                          >
                            {fmt(thisVal)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: '#475569' }}>
                            Last month
                          </div>
                          <div style={{ fontSize: '13px', color: C.muted }}>
                            {fmt(lastVal)}
                          </div>
                        </div>
                      </div>
                      {lastVal > 0 && (
                        <div
                          style={{
                            marginTop: '8px',
                            fontSize: '12px',
                            color: isGood ? C.green : C.red,
                            fontWeight: 600,
                          }}
                        >
                          {diff >= 0 ? '▲' : '▼'} {fmt(Math.abs(diff))} (
                          {Math.abs(Math.round((diff / lastVal) * 100))}%){' '}
                          {isGood ? '✓ Better' : '✗ Worse'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* User stats */}
              <div style={S.card}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  👥 Platform Users
                </h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  {[
                    {
                      label: 'Total Users',
                      value: totalUsers,
                      color: C.purple,
                    },
                    { label: 'Active', value: activeUsers, color: C.green },
                    {
                      label: 'Admins',
                      value: users.filter((u) => u.role === 'ADMIN').length,
                      color: C.red,
                    },
                    {
                      label: 'Analysts',
                      value: users.filter((u) => u.role === 'ANALYST').length,
                      color: C.yellow,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        padding: '14px',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '26px',
                          fontWeight: 800,
                          color: s.color,
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: C.muted,
                          marginTop: '2px',
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Active bar */}
                <div
                  style={{
                    fontSize: '12px',
                    color: C.muted,
                    marginBottom: '6px',
                  }}
                >
                  Active rate:{' '}
                  {totalUsers > 0
                    ? Math.round((activeUsers / totalUsers) * 100)
                    : 0}
                  %
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '3px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%`,
                      background: 'linear-gradient(90deg,#10b981,#34d399)',
                      borderRadius: '3px',
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Trend chart */}
            <div style={S.card}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <h2
                  style={{ fontSize: '16px', fontWeight: 700, color: C.text }}
                >
                  📊 {trendPeriod === 'monthly' ? 'Monthly' : 'Weekly'} Trends
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['monthly', 'weekly'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTrendPeriod(p)}
                      style={
                        trendPeriod === p
                          ? S.btn
                          : { ...S.btnOutline, padding: '6px 14px' }
                      }
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {trends.length === 0 ? (
                <div
                  style={{
                    color: C.muted,
                    textAlign: 'center',
                    padding: '40px',
                  }}
                >
                  No trend data yet.
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-end',
                      height: '180px',
                      paddingBottom: '28px',
                      overflowX: 'auto',
                    }}
                  >
                    {trends.map((t) => {
                      const incH = Math.round((t.income / maxTrend) * 140)
                      const expH = Math.round((t.expense / maxTrend) * 140)
                      return (
                        <div
                          key={t.period}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            flex: 1,
                            minWidth: '60px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              gap: '4px',
                              alignItems: 'flex-end',
                            }}
                          >
                            <div
                              title={`Income: ${fmt(t.income)}`}
                              style={{
                                width: '22px',
                                height: `${incH || 4}px`,
                                background: 'rgba(52,211,153,0.75)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.4s',
                              }}
                            />
                            <div
                              title={`Expense: ${fmt(t.expense)}`}
                              style={{
                                width: '22px',
                                height: `${expH || 4}px`,
                                background: 'rgba(248,113,113,0.75)',
                                borderRadius: '4px 4px 0 0',
                                transition: 'height 0.4s',
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              color: C.muted,
                              textAlign: 'center',
                              marginTop: '4px',
                            }}
                          >
                            {t.period}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: C.green }}>
                      ■ Income
                    </span>
                    <span style={{ fontSize: '12px', color: C.red }}>
                      ■ Expense
                    </span>
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
              {/* Category breakdown */}
              <div style={S.card}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  🗂️ Category Breakdown
                </h2>
                {(summary?.categoryTotals ?? []).length === 0 ? (
                  <div style={{ color: C.muted }}>No data yet.</div>
                ) : (
                  (summary?.categoryTotals ?? []).slice(0, 7).map((ct) => {
                    const w = pct(ct.total, summary?.totalExpense || 1)
                    return (
                      <div key={ct.category} style={{ marginBottom: '12px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '5px',
                          }}
                        >
                          <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                            {ct.category}
                          </span>
                          <span
                            style={{
                              fontSize: '13px',
                              color: C.sub,
                              fontWeight: 600,
                            }}
                          >
                            {fmt(ct.total)}
                          </span>
                        </div>
                        <div
                          style={{
                            height: '5px',
                            background: 'rgba(255,255,255,0.07)',
                            borderRadius: '3px',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${w}%`,
                              background:
                                'linear-gradient(90deg,#6366f1,#818cf8)',
                              borderRadius: '3px',
                              transition: 'width 0.5s',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Budget tracker */}
              <div style={S.card}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  🎯 Budget Tracker{' '}
                  <span
                    style={{
                      fontSize: '11px',
                      color: C.muted,
                      fontWeight: 400,
                    }}
                  >
                    This Month
                  </span>
                </h2>
                {Object.entries(budgets).map(([cat, limit]) => {
                  const spent = currentMonthSpend[cat] || 0
                  const p = pct(spent, limit)
                  const over = spent > limit
                  const warn = p >= 80
                  return (
                    <div key={cat} style={{ marginBottom: '12px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '5px',
                        }}
                      >
                        <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                          {cat}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          {over && (
                            <span
                              style={{
                                fontSize: '10px',
                                color: C.red,
                                fontWeight: 700,
                              }}
                            >
                              OVER
                            </span>
                          )}
                          {editBudgetCat === cat ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input
                                style={{
                                  ...S.input,
                                  width: '70px',
                                  padding: '2px 6px',
                                  fontSize: '12px',
                                }}
                                value={editBudgetVal}
                                onChange={(e) =>
                                  setEditBudgetVal(e.target.value)
                                }
                                type="number"
                              />
                              <button
                                style={{
                                  ...S.btnGreen,
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                }}
                                onClick={() => {
                                  setBudgets((b) => ({
                                    ...b,
                                    [cat]: parseFloat(editBudgetVal) || limit,
                                  }))
                                  setEditBudgetCat(null)
                                }}
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <button
                              style={{
                                ...S.btnOutline,
                                padding: '2px 8px',
                                fontSize: '11px',
                              }}
                              onClick={() => {
                                setEditBudgetCat(cat)
                                setEditBudgetVal(String(limit))
                              }}
                            >
                              {fmt(spent)}/{fmt(limit)}
                            </button>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          height: '5px',
                          background: 'rgba(255,255,255,0.07)',
                          borderRadius: '3px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${p}%`,
                            background: over
                              ? C.red
                              : warn
                                ? C.yellow
                                : C.green,
                            borderRadius: '3px',
                            transition: 'width 0.4s',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
                <div
                  style={{
                    fontSize: '11px',
                    color: '#475569',
                    marginTop: '8px',
                  }}
                >
                  Click any budget to edit the limit.
                </div>
              </div>
            </div>

            {/* Recent activity */}
            {(summary?.recentActivity ?? []).length > 0 && (
              <div style={S.card}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  ⚡ Recent Activity
                </h2>
                {summary!.recentActivity.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '10px',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: ac(a.user.name),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {a.user.name.charAt(0)}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: '13px',
                            color: C.text,
                            fontWeight: 600,
                          }}
                        >
                          {a.user.name}
                        </span>
                        <span style={{ fontSize: '13px', color: C.muted }}>
                          {' '}
                          ·{' '}
                        </span>
                        <span style={{ ...S.badge, ...badgeColor(a.action) }}>
                          {a.action}
                        </span>
                        <span style={{ fontSize: '12px', color: C.muted }}>
                          {' '}
                          on {a.entity}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {/* ── HISTORY ── */}
        {tab === 'history' && (
          <div style={S.card}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.text }}>
                Transaction History
              </h2>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: C.sub,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                />{' '}
                Show deleted
              </label>
            </div>
            <input
              style={{ ...S.input, maxWidth: '380px', marginBottom: '16px' }}
              placeholder="🔍 Search notes, category, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '16px',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
              }}
            >
              {[
                {
                  label: 'View User',
                  type: 'select',
                  value: filterUserId,
                  onChange: (v: string) => setFilterUserId(v),
                  options: [
                    { v: '', l: 'All Users' },
                    ...users.map((u) => ({
                      v: u.id,
                      l: `${u.name} (${u.role})`,
                    })),
                  ],
                },
                {
                  label: 'Show',
                  type: 'select',
                  value: showKind,
                  onChange: (v: string) =>
                    setShowKind(v as 'all' | 'records' | 'transfers'),
                  options: [
                    { v: 'all', l: 'All' },
                    { v: 'records', l: 'Records' },
                    { v: 'transfers', l: 'Transfers' },
                  ],
                },
                {
                  label: 'Type',
                  type: 'select',
                  value: filterType,
                  onChange: (v: string) => setFilterType(v),
                  options: [
                    { v: '', l: 'All' },
                    { v: 'INCOME', l: 'Income' },
                    { v: 'EXPENSE', l: 'Expense' },
                  ],
                },
              ].map((f) => (
                <div key={f.label} style={{ minWidth: '140px' }}>
                  <label style={S.label}>{f.label}</label>
                  <select
                    style={S.input}
                    value={f.value}
                    onChange={(e) => f.onChange(e.target.value)}
                  >
                    {f.options.map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div style={{ minWidth: '120px' }}>
                <label style={S.label}>From</label>
                <input
                  style={S.input}
                  type="date"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                />
              </div>
              <div style={{ minWidth: '120px' }}>
                <label style={S.label}>To</label>
                <input
                  style={S.input}
                  type="date"
                  value={filterEnd}
                  onChange={(e) => setFilterEnd(e.target.value)}
                />
              </div>
              <div
                style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}
              >
                <button style={S.btn} onClick={fetchHistory}>
                  Apply
                </button>
                <button
                  style={S.btnOutline}
                  onClick={() => {
                    setFilterType('')
                    setFilterCat('')
                    setFilterStart('')
                    setFilterEnd('')
                    setFilterUserId('')
                    setShowKind('all')
                    setSearchQuery('')
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#475569',
                marginBottom: '12px',
              }}
            >
              {historyRows.length} result{historyRows.length !== 1 ? 's' : ''}
            </div>
            {histMsg && <div style={S.success}>{histMsg}</div>}
            {histErr && <div style={S.errorBox}>{histErr}</div>}
            {historyLoading ? (
              <Spinner text="Loading transactions..." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {[
                        'User',
                        'Type',
                        'Category',
                        'Amount',
                        'Date',
                        'Notes',
                        'Source',
                        'Status',
                        'Actions',
                      ].map((h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyRows.map((row) => (
                      <tr
                        key={row.id}
                        style={{ opacity: row.deletedAt ? 0.5 : 1 }}
                      >
                        <td style={S.td}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: ac(row.userName),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#fff',
                                flexShrink: 0,
                              }}
                            >
                              {row.userName.charAt(0)}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: C.text,
                                }}
                              >
                                {row.userName}
                              </div>
                              <div style={{ fontSize: '11px', color: C.muted }}>
                                {row.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>
                          <span style={{ ...S.badge, ...badgeColor(row.type) }}>
                            {row.type}
                          </span>
                        </td>
                        <td style={S.td}>
                          <span
                            style={{ ...S.badge, ...badgeColor(row.category) }}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td
                          style={{
                            ...S.td,
                            fontWeight: 700,
                            color: row.type === 'INCOME' ? C.green : C.red,
                          }}
                        >
                          {row.type === 'INCOME' ? '+' : '−'}
                          {fmt(row.amount)}
                        </td>
                        <td style={{ ...S.td, fontSize: '13px' }}>
                          {new Date(row.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td
                          style={{
                            ...S.td,
                            color: C.sub,
                            fontSize: '13px',
                            maxWidth: '160px',
                          }}
                        >
                          <div
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.notes || '—'}
                          </div>
                        </td>
                        <td style={S.td}>
                          <span
                            style={{
                              ...S.badge,
                              background:
                                row.kind === 'transfer'
                                  ? 'rgba(245,158,11,0.15)'
                                  : 'rgba(99,102,241,0.15)',
                              color:
                                row.kind === 'transfer' ? C.yellow : C.purple,
                            }}
                          >
                            {row.kind === 'transfer'
                              ? '💸 Transfer'
                              : '📋 Record'}
                          </span>
                        </td>
                        <td style={S.td}>
                          <span
                            style={{
                              ...S.badge,
                              ...badgeColor(
                                row.deletedAt ? 'Deleted' : 'Active',
                              ),
                            }}
                          >
                            {row.deletedAt ? 'Deleted' : 'Active'}
                          </span>
                        </td>
                        <td style={S.td}>
                          {row.kind === 'transfer' ? (
                            <span
                              style={{ color: '#475569', fontSize: '12px' }}
                            >
                              —
                            </span>
                          ) : !row.deletedAt ? (
                            <button
                              style={S.btnRed}
                              onClick={() => softDelete(row.id)}
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              style={S.btnOutline}
                              onClick={() => restore(row.id)}
                            >
                              Restore
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {historyRows.length === 0 && (
                      <tr>
                        <td
                          style={{
                            ...S.td,
                            textAlign: 'center',
                            color: C.muted,
                            padding: '48px',
                          }}
                          colSpan={9}
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ADD RECORD ── */}
        {tab === 'add' && (
          <div style={{ maxWidth: '640px' }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: C.text,
                marginBottom: '24px',
              }}
            >
              ➕ Add Financial Record
            </h2>
            <div style={S.card}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={S.label}>Type</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['EXPENSE', 'INCOME'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setRecType(t)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background:
                            recType === t
                              ? t === 'INCOME'
                                ? 'rgba(16,185,129,0.2)'
                                : 'rgba(239,68,68,0.2)'
                              : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${recType === t ? (t === 'INCOME' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)') : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '10px',
                          color:
                            recType === t
                              ? t === 'INCOME'
                                ? C.green
                                : C.red
                              : C.sub,
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {t === 'INCOME' ? '📈 Income' : '📉 Expense'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={S.label}>Category</label>
                  <select
                    style={S.input}
                    value={recCat}
                    onChange={(e) => setRecCat(e.target.value)}
                  >
                    {CATS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Amount (₹)</label>
                  <input
                    style={S.input}
                    type="number"
                    value={recAmount}
                    onChange={(e) => setRecAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                  />
                </div>
                <div>
                  <label style={S.label}>Date</label>
                  <input
                    style={S.input}
                    type="date"
                    value={recDate}
                    onChange={(e) => setRecDate(e.target.value)}
                  />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={S.label}>Notes (optional)</label>
                  <input
                    style={S.input}
                    value={recNotes}
                    onChange={(e) => setRecNotes(e.target.value)}
                    placeholder="What was this for?"
                  />
                </div>
              </div>
              {recType === 'EXPENSE' && budgets[recCat] && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: C.yellow,
                  }}
                >
                  💡 Budget: {fmt(currentMonthSpend[recCat] || 0)} spent /{' '}
                  {fmt(budgets[recCat])} limit this month
                </div>
              )}
              {recMsg && (
                <div style={{ ...S.success, marginTop: '16px' }}>{recMsg}</div>
              )}
              {recErr && (
                <div style={{ ...S.errorBox, marginTop: '16px' }}>{recErr}</div>
              )}
              <button
                style={{
                  ...S.btn,
                  marginTop: '20px',
                  width: '100%',
                  padding: '13px',
                }}
                onClick={addRecord}
                disabled={recLoading}
              >
                {recLoading ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    Saving...
                  </span>
                ) : (
                  '➕ Add Record'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── SEND MONEY ── */}
        {tab === 'send' && (
          <div style={{ maxWidth: '540px' }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: C.text,
                marginBottom: '24px',
              }}
            >
              💸 Send Money
            </h2>
            <div style={S.card}>
              <div
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '13px', color: C.sub }}>
                  Available Balance
                </span>
                <span
                  style={{ fontSize: '22px', fontWeight: 800, color: C.green }}
                >
                  {fmt(balance)}
                </span>
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
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
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="0"
                    min="1"
                  />
                  {txAmount && parseFloat(txAmount) > balance && (
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: C.red,
                      }}
                    >
                      ⚠️ Exceeds your balance
                    </div>
                  )}
                </div>
                <div>
                  <label style={S.label}>Notes (optional)</label>
                  <input
                    style={S.input}
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    placeholder="Payment for..."
                  />
                </div>
              </div>
              {txMsg && (
                <div style={{ ...S.success, marginTop: '16px' }}>{txMsg}</div>
              )}
              {txErr && (
                <div style={{ ...S.errorBox, marginTop: '16px' }}>{txErr}</div>
              )}
              <button
                style={{
                  ...S.btnGreen,
                  marginTop: '20px',
                  width: '100%',
                  padding: '13px',
                }}
                onClick={sendMoney}
                disabled={
                  txLoading || (!!txAmount && parseFloat(txAmount) > balance)
                }
              >
                {txLoading ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    Sending...
                  </span>
                ) : (
                  '💸 Send Money'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div style={S.card}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.text }}>
                👥 Manage Users
              </h2>
              <input
                style={{ ...S.input, width: '240px' }}
                placeholder="🔍 Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            {userMsg && <div style={S.success}>{userMsg}</div>}
            {userErr && <div style={S.errorBox}>{userErr}</div>}
            {usersLoading ? (
              <Spinner text="Loading users..." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['User', 'Role', 'Balance', 'Status', 'Actions'].map(
                        (h) => (
                          <th key={h} style={S.th}>
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={S.td}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                            }}
                          >
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: ac(u.name),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#fff',
                              }}
                            >
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: C.text }}>
                                {u.name}
                              </div>
                              <div style={{ fontSize: '12px', color: C.muted }}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>
                          <select
                            style={{
                              ...S.input,
                              width: 'auto',
                              padding: '4px 8px',
                              fontSize: '12px',
                            }}
                            value={u.role}
                            onChange={(e) =>
                              updateUserRole(u.id, e.target.value)
                            }
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="ANALYST">ANALYST</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td
                          style={{ ...S.td, color: C.green, fontWeight: 700 }}
                        >
                          {fmt(u.balance)}
                        </td>
                        <td style={S.td}>
                          <span
                            style={{
                              ...S.badge,
                              ...badgeColor(u.isActive ? 'Active' : 'Inactive'),
                            }}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              style={S.btnOutline}
                              onClick={() => toggleActive(u.id, u.isActive)}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              style={S.btnRed}
                              onClick={() => deleteUser(u.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          style={{
                            ...S.td,
                            textAlign: 'center',
                            color: C.muted,
                          }}
                          colSpan={5}
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── INVITES ── */}
        {tab === 'invites' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={S.card}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '20px',
                }}
              >
                ✉️ Create Invite
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <label style={S.label}>Email</label>
                  <input
                    style={S.input}
                    type="email"
                    value={invEmail}
                    onChange={(e) => setInvEmail(e.target.value)}
                    placeholder="newuser@example.com"
                  />
                </div>
                <div>
                  <label style={S.label}>Role</label>
                  <select
                    style={S.input}
                    value={invRole}
                    onChange={(e) =>
                      setInvRole(
                        e.target.value as 'VIEWER' | 'ANALYST' | 'ADMIN',
                      )
                    }
                  >
                    <option value="VIEWER">VIEWER</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              {invMsg && <div style={S.success}>{invMsg}</div>}
              {invErr && <div style={S.errorBox}>{invErr}</div>}
              {invUrl && (
                <div
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: C.muted,
                      marginBottom: '6px',
                    }}
                  >
                    Invite link:
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: C.purple,
                      wordBreak: 'break-all',
                      marginBottom: '10px',
                    }}
                  >
                    {invUrl}
                  </div>
                  <button
                    style={S.btnOutline}
                    onClick={async () => {
                      await navigator.clipboard.writeText(invUrl)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? '✅ Copied!' : '📋 Copy Link'}
                  </button>
                </div>
              )}
              <button
                style={S.btn}
                onClick={createInvite}
                disabled={invLoading}
              >
                {invLoading ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        display: 'inline-block',
                      }}
                    />
                    Creating...
                  </span>
                ) : (
                  '✉️ Send Invite'
                )}
              </button>
            </div>
            <div style={S.card}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '16px',
                }}
              >
                All Invites
              </h2>
              {invitesLoading ? (
                <Spinner text="Loading invites..." />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Email', 'Role', 'Created By', 'Expires', 'Status'].map(
                        (h) => (
                          <th key={h} style={S.th}>
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((inv) => {
                      const expired = new Date(inv.expiresAt) < new Date()
                      const status = inv.usedAt
                        ? 'Used'
                        : expired
                          ? 'Expired'
                          : 'Active'
                      return (
                        <tr key={inv.id}>
                          <td style={S.td}>{inv.email}</td>
                          <td style={S.td}>
                            <span
                              style={{ ...S.badge, ...badgeColor(inv.role) }}
                            >
                              {inv.role}
                            </span>
                          </td>
                          <td style={S.td}>{inv.creator.name}</td>
                          <td style={S.td}>
                            {new Date(inv.expiresAt).toLocaleDateString()}
                          </td>
                          <td style={S.td}>
                            <span
                              style={{
                                ...S.badge,
                                ...badgeColor(
                                  status === 'Active'
                                    ? 'Active'
                                    : status === 'Used'
                                      ? 'VIEWER'
                                      : 'Deleted',
                                ),
                              }}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {invites.length === 0 && (
                      <tr>
                        <td
                          style={{
                            ...S.td,
                            textAlign: 'center',
                            color: C.muted,
                          }}
                          colSpan={5}
                        >
                          No invites yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── AUDIT ── */}
        {tab === 'audit' && (
          <div style={S.card}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: C.text,
                  flex: 1,
                }}
              >
                🔍 Audit Logs
              </h2>
              <select
                style={{ ...S.input, width: '180px' }}
                value={auditEntity}
                onChange={(e) => setAuditEntity(e.target.value)}
              >
                <option value="">All Entities</option>
                <option value="FinancialRecord">FinancialRecord</option>
                <option value="Transfer">Transfer</option>
                <option value="User">User</option>
                <option value="InviteToken">InviteToken</option>
              </select>
              <button style={S.btn} onClick={fetchAudit}>
                Refresh
              </button>
            </div>
            {auditLoading ? (
              <Spinner text="Loading audit logs..." />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['User', 'Action', 'Entity', 'Entity ID', 'Time'].map(
                      (h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={S.td}>
                        <div style={{ fontWeight: 600, color: C.text }}>
                          {log.user.name}
                        </div>
                        <div style={{ fontSize: '11px', color: C.muted }}>
                          {log.user.email}
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...badgeColor(log.action) }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={S.td}>{log.entity}</td>
                      <td
                        style={{
                          ...S.td,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                        }}
                      >
                        {log.entityId.slice(0, 12)}...
                      </td>
                      <td style={S.td}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td
                        style={{ ...S.td, textAlign: 'center', color: C.muted }}
                        colSpan={5}
                      >
                        No logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── EXPORT ── */}
        {tab === 'export' && (
          <div style={{ maxWidth: '520px' }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: C.text,
                marginBottom: '24px',
              }}
            >
              📤 Export Records
            </h2>
            <div style={S.card}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
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
                  <label style={S.label}>Type</label>
                  <select
                    style={S.input}
                    value={expType}
                    onChange={(e) => setExpType(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
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
                style={{
                  ...S.btnGreen,
                  marginTop: '20px',
                  width: '100%',
                  padding: '13px',
                }}
                onClick={handleExport}
              >
                📥 Download {expFormat.toUpperCase()}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
