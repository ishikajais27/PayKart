'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface FinancialRecord {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
  deletedAt?: string | null
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

type Tab = 'dashboard' | 'records' | 'add' | 'send' | 'analytics' | 'export'
const NAV = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: '📊' },
  { id: 'records' as Tab, label: 'Records', icon: '📋' },
  { id: 'add' as Tab, label: 'Add Record', icon: '➕' },
  { id: 'send' as Tab, label: 'Send Money', icon: '💸' },
  { id: 'analytics' as Tab, label: 'Analytics', icon: '📉' },
  { id: 'export' as Tab, label: 'Export', icon: '📤' },
]
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
  if (['INCOME', 'Active'].includes(v))
    return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
  if (['EXPENSE', 'SOFT_DELETE'].includes(v))
    return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
  if (['UPDATE', 'CREATE', 'Transfer In'].includes(v))
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
  main: { marginLeft: '240px', flex: 1, padding: '28px 32px' },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
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
  statCard: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center' as const,
  },
}

export default function AnalystDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [name, setName] = useState('')
  const [balance, setBalance] = useState(0)
  const [userId, setUserId] = useState('')
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20
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
  const [cmpA, setCmpA] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
  })
  const [cmpB, setCmpB] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [expFormat, setExpFormat] = useState<'csv' | 'json'>('csv')
  const [expType, setExpType] = useState('')
  const [expStart, setExpStart] = useState('')
  const [expEnd, setExpEnd] = useState('')
  const [expMsg, setExpMsg] = useState('')

  const hdrs = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  })

  const fetchMe = useCallback(async () => {
    const r = await fetch('/api/auth/me', { headers: hdrs() })
    const j = await r.json()
    if (j.success) {
      setBalance(j.data.balance ?? 0)
      setUserId(j.data.id)
    } else router.push('/login')
  }, [])

  const fetchData = useCallback(async () => {
    const p = new URLSearchParams()
    if (filterType) p.set('type', filterType)
    if (filterCat) p.set('category', filterCat)
    if (filterStart) p.set('startDate', filterStart)
    if (filterEnd) p.set('endDate', filterEnd)
    const [rr, tr] = await Promise.all([
      fetch(`/api/records?${p}`, { headers: hdrs() }),
      fetch('/api/transfers', { headers: hdrs() }),
    ])
    const rj = await rr.json()
    const tj = await tr.json()
    if (rj.success) setRecords(rj.data)
    if (tj.success) setTransfers(tj.data)
    setPage(1)
  }, [filterType, filterCat, filterStart, filterEnd])

  useEffect(() => {
    setName(localStorage.getItem('name') || 'Analyst')
    fetchMe()
  }, [])
  useEffect(() => {
    fetchData()
  }, [fetchData])
  useEffect(() => {
    if (tab === 'add' || tab === 'send') fetchMe()
  }, [tab])

  const allRows = useMemo(() => {
    const catAmounts: Record<string, number[]> = {}
    records
      .filter((r) => !r.deletedAt)
      .forEach((r) => {
        if (!catAmounts[r.category]) catAmounts[r.category] = []
        catAmounts[r.category].push(r.amount)
      })
    const catAvg: Record<string, number> = {}
    Object.entries(catAmounts).forEach(([k, v]) => {
      catAvg[k] = v.reduce((a, b) => a + b, 0) / v.length
    })
    const rows: {
      id: string
      type: 'INCOME' | 'EXPENSE'
      category: string
      amount: number
      date: string
      notes?: string
      source: string
      anomaly: boolean
    }[] = []
    records
      .filter((r) => !r.deletedAt)
      .forEach((r) =>
        rows.push({
          id: r.id,
          type: r.type,
          category: r.category,
          amount: r.amount,
          date: r.date,
          notes: r.notes,
          source: 'Record',
          anomaly: catAvg[r.category]
            ? r.amount > catAvg[r.category] * 3
            : false,
        }),
      )
    transfers.forEach((t) => {
      if (t.from.id === userId)
        rows.push({
          id: `out_${t.id}`,
          type: 'EXPENSE',
          category: 'Transfer Out',
          amount: t.amount,
          date: t.createdAt,
          notes: `→ ${t.to.name}`,
          source: 'Transfer',
          anomaly: false,
        })
      if (t.to.id === userId)
        rows.push({
          id: `in_${t.id}`,
          type: 'INCOME',
          category: 'Transfer In',
          amount: t.amount,
          date: t.createdAt,
          notes: `← ${t.from.name}`,
          source: 'Transfer',
          anomaly: false,
        })
    })
    let result = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.notes?.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q),
      )
    }
    if (filterType) result = result.filter((r) => r.type === filterType)
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [records, transfers, userId, search, filterType])

  const paginated = useMemo(
    () => allRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allRows, page],
  )
  const totalPages = Math.ceil(allRows.length / PAGE_SIZE)

  const now = new Date()
  const thisMonthRows = allRows.filter((r) => {
    const d = new Date(r.date)
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    )
  })
  const thisIncome = thisMonthRows
    .filter((r) => r.type === 'INCOME')
    .reduce((s, r) => s + r.amount, 0)
  const thisExpense = thisMonthRows
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + r.amount, 0)

  const monthlyTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const label = d.toLocaleDateString('en-IN', {
        month: 'short',
        year: '2-digit',
      })
      const mRows = allRows.filter((r) => {
        const rd = new Date(r.date)
        return (
          rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
        )
      })
      return {
        label,
        income: mRows
          .filter((r) => r.type === 'INCOME')
          .reduce((s, r) => s + r.amount, 0),
        expense: mRows
          .filter((r) => r.type === 'EXPENSE')
          .reduce((s, r) => s + r.amount, 0),
      }
    })
  }, [allRows])

  const savingsReport = useMemo(
    () => monthlyTrend.map((m) => ({ ...m, savings: m.income - m.expense })),
    [monthlyTrend],
  )
  const bestMonth = savingsReport.length
    ? savingsReport.reduce((a, b) => (b.savings > a.savings ? b : a))
    : null
  const worstMonth = savingsReport.length
    ? savingsReport.reduce((a, b) => (b.savings < a.savings ? b : a))
    : null
  const maxTrend = Math.max(
    ...monthlyTrend.flatMap((t) => [t.income, t.expense]),
    1,
  )

  const recurringExpenses = useMemo(() => {
    const catMonths: Record<string, Set<string>> = {}
    records
      .filter((r) => !r.deletedAt && r.type === 'EXPENSE')
      .forEach((r) => {
        const key = r.category
        const month = new Date(r.date).toISOString().slice(0, 7)
        if (!catMonths[key]) catMonths[key] = new Set()
        catMonths[key].add(month)
      })
    return Object.entries(catMonths)
      .filter(([, m]) => m.size >= 3)
      .map(([cat, m]) => ({ cat, months: m.size }))
      .sort((a, b) => b.months - a.months)
  }, [records])

  const periodRows = (ym: string) =>
    allRows.filter((r) => new Date(r.date).toISOString().slice(0, 7) === ym)
  const pA = {
    income: periodRows(cmpA)
      .filter((r) => r.type === 'INCOME')
      .reduce((s, r) => s + r.amount, 0),
    expense: periodRows(cmpA)
      .filter((r) => r.type === 'EXPENSE')
      .reduce((s, r) => s + r.amount, 0),
  }
  const pB = {
    income: periodRows(cmpB)
      .filter((r) => r.type === 'INCOME')
      .reduce((s, r) => s + r.amount, 0),
    expense: periodRows(cmpB)
      .filter((r) => r.type === 'EXPENSE')
      .reduce((s, r) => s + r.amount, 0),
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
        fetchMe()
        fetchData()
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
        fetchMe()
      } else setTxErr(j.message)
    } finally {
      setTxLoading(false)
    }
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

  return (
    <div style={S.page}>
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
            <span style={{ fontSize: '16px', fontWeight: 800, color: C.text }}>
              PayKart
            </span>
            <span
              style={{
                fontSize: '10px',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: C.purple,
                padding: '2px 8px',
                borderRadius: '5px',
                fontWeight: 700,
              }}
            >
              ANALYST
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
        <nav style={{ flex: 1, padding: '12px 0' }}>
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

      <div style={S.main}>
        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <>
            <div style={{ marginBottom: '24px' }}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: '4px',
                }}
              >
                Welcome back, {name} 👋
              </h1>
              <p style={{ color: C.muted, fontSize: '14px' }}>
                Your financial overview for this month.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4,1fr)',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              {[
                {
                  label: 'My Balance',
                  value: fmt(balance),
                  color: C.purple,
                  icon: '💰',
                },
                {
                  label: 'Income This Month',
                  value: fmt(thisIncome),
                  color: C.green,
                  icon: '📈',
                },
                {
                  label: 'Expenses This Month',
                  value: fmt(thisExpense),
                  color: C.red,
                  icon: '📉',
                },
                {
                  label: 'Net Savings',
                  value: fmt(thisIncome - thisExpense),
                  color: thisIncome - thisExpense >= 0 ? C.green : C.red,
                  icon: '💎',
                },
              ].map((s) => (
                <div key={s.label} style={S.statCard}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {s.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: C.muted,
                      marginBottom: '4px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Trend */}
            <div style={S.card}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '16px',
                }}
              >
                📊 Monthly Trend — Last 6 Months
              </h2>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-end',
                  height: '160px',
                  paddingBottom: '24px',
                  overflowX: 'auto',
                }}
              >
                {monthlyTrend.map((t) => {
                  const incH = Math.round((t.income / maxTrend) * 120)
                  const expH = Math.round((t.expense / maxTrend) * 120)
                  return (
                    <div
                      key={t.label}
                      style={{
                        flex: 1,
                        minWidth: '60px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
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
                          title={fmt(t.income)}
                          style={{
                            width: '20px',
                            height: `${incH || 4}px`,
                            background: 'rgba(52,211,153,0.75)',
                            borderRadius: '4px 4px 0 0',
                          }}
                        />
                        <div
                          title={fmt(t.expense)}
                          style={{
                            width: '20px',
                            height: `${expH || 4}px`,
                            background: 'rgba(248,113,113,0.75)',
                            borderRadius: '4px 4px 0 0',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: C.muted,
                          textAlign: 'center',
                        }}
                      >
                        {t.label}
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
            </div>

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
                  🔁 Recurring Expenses
                </h2>
                {recurringExpenses.length === 0 ? (
                  <div style={{ color: C.muted }}>
                    No recurring patterns yet.
                  </div>
                ) : (
                  recurringExpenses.slice(0, 5).map((r) => (
                    <div
                      key={r.cat}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        marginBottom: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: C.text,
                        }}
                      >
                        {r.cat}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          background: 'rgba(99,102,241,0.15)',
                          color: C.purple,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontWeight: 600,
                        }}
                      >
                        📅 {r.months} months
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div style={S.card}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  📅 Best & Worst Months
                </h2>
                {[
                  {
                    label: '🏆 Best Month',
                    m: bestMonth,
                    color: C.green,
                    bg: 'rgba(16,185,129,0.08)',
                    border: 'rgba(16,185,129,0.2)',
                  },
                  {
                    label: '📉 Worst Month',
                    m: worstMonth,
                    color: C.red,
                    bg: 'rgba(239,68,68,0.08)',
                    border: 'rgba(239,68,68,0.2)',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: item.bg,
                      border: `1px solid ${item.border}`,
                      borderRadius: '10px',
                      padding: '14px',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: C.muted,
                        marginBottom: '4px',
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: item.color,
                      }}
                    >
                      {item.m?.label ?? '—'}
                    </div>
                    <div style={{ fontSize: '13px', color: C.sub }}>
                      Net: {fmt(item.m?.savings ?? 0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── RECORDS ── */}
        {tab === 'records' && (
          <div style={S.card}>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: C.text,
                marginBottom: '20px',
              }}
            >
              📋 My Records
            </h2>
            <input
              style={{ ...S.input, maxWidth: '380px', marginBottom: '16px' }}
              placeholder="🔍 Search notes, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
                  label: 'Type',
                  value: filterType,
                  onChange: (v: string) => setFilterType(v),
                  options: [
                    { v: '', l: 'All' },
                    { v: 'INCOME', l: 'Income' },
                    { v: 'EXPENSE', l: 'Expense' },
                  ],
                },
                {
                  label: 'Category',
                  value: filterCat,
                  onChange: (v: string) => setFilterCat(v),
                  options: [
                    { v: '', l: 'All' },
                    ...CATS.map((c) => ({ v: c, l: c })),
                  ],
                },
              ].map((f) => (
                <div key={f.label} style={{ minWidth: '130px' }}>
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
                <button style={S.btn} onClick={fetchData}>
                  Apply
                </button>
                <button
                  style={S.btnOutline}
                  onClick={() => {
                    setFilterType('')
                    setFilterCat('')
                    setFilterStart('')
                    setFilterEnd('')
                    setSearch('')
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#475569',
                marginBottom: '12px',
              }}
            >
              <span>
                {allRows.length} total · Page {page}/{totalPages || 1}
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {[
                      'Type',
                      'Category',
                      'Amount',
                      'Date',
                      'Notes',
                      'Source',
                      '⚠️',
                    ].map((h) => (
                      <th key={h} style={S.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => (
                    <tr
                      key={row.id}
                      style={{
                        background: row.anomaly
                          ? 'rgba(245,158,11,0.03)'
                          : 'transparent',
                      }}
                    >
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
                          maxWidth: '180px',
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
                              row.source === 'Transfer'
                                ? 'rgba(245,158,11,0.15)'
                                : 'rgba(99,102,241,0.15)',
                            color:
                              row.source === 'Transfer' ? C.yellow : C.purple,
                          }}
                        >
                          {row.source === 'Transfer' ? '💸' : '📋'} {row.source}
                        </span>
                      </td>
                      <td style={S.td}>
                        {row.anomaly && <span title="Unusually high">⚠️</span>}
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td
                        style={{
                          ...S.td,
                          textAlign: 'center',
                          color: C.muted,
                          padding: '48px',
                        }}
                        colSpan={7}
                      >
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '16px',
                  justifyContent: 'center',
                }}
              >
                <button
                  style={S.btnOutline}
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  «
                </button>
                <button
                  style={S.btnOutline}
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹
                </button>
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    style={{
                      ...S.btnOutline,
                      ...(p === page
                        ? { background: 'rgba(99,102,241,0.3)', color: C.text }
                        : {}),
                    }}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  style={S.btnOutline}
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ›
                </button>
                <button
                  style={S.btnOutline}
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  »
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ADD RECORD ── */}
        {tab === 'add' && (
          <div style={{ maxWidth: '580px' }}>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: C.text,
                marginBottom: '24px',
              }}
            >
              ➕ Add Record
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
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
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
                {recLoading ? 'Saving...' : '➕ Add Record'}
              </button>
            </div>
          </div>
        )}

        {/* ── SEND MONEY ── */}
        {tab === 'send' && (
          <div style={{ maxWidth: '480px' }}>
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
                {txLoading ? 'Sending...' : '💸 Send Money'}
              </button>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: C.text,
                marginBottom: '24px',
              }}
            >
              📉 Analytics
            </h2>
            {/* Period comparison */}
            <div style={S.card}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '16px',
                }}
              >
                📅 Period Comparison
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <label style={S.label}>Period A</label>
                  <input
                    style={{ ...S.input, width: '160px' }}
                    type="month"
                    value={cmpA}
                    onChange={(e) => setCmpA(e.target.value)}
                  />
                </div>
                <div>
                  <label style={S.label}>Period B</label>
                  <input
                    style={{ ...S.input, width: '160px' }}
                    type="month"
                    value={cmpB}
                    onChange={(e) => setCmpB(e.target.value)}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '16px',
                }}
              >
                {(['Income', 'Expense', 'Savings'] as const).map((type) => {
                  const getVal = (p: { income: number; expense: number }) =>
                    type === 'Income'
                      ? p.income
                      : type === 'Expense'
                        ? p.expense
                        : p.income - p.expense
                  const aVal = getVal(pA)
                  const bVal = getVal(pB)
                  const diff = bVal - aVal
                  const isGood =
                    type === 'Income'
                      ? diff >= 0
                      : type === 'Expense'
                        ? diff <= 0
                        : diff >= 0
                  return (
                    <div
                      key={type}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        padding: '16px',
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
                          marginBottom: '8px',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '10px', color: '#475569' }}>
                            {cmpA}
                          </div>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              color: C.text,
                            }}
                          >
                            {fmt(aVal)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: '#475569' }}>
                            {cmpB}
                          </div>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              color: C.text,
                            }}
                          >
                            {fmt(bVal)}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: isGood ? C.green : C.red,
                          fontWeight: 600,
                        }}
                      >
                        {diff >= 0 ? '▲' : '▼'} {fmt(Math.abs(diff))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Monthly savings report */}
            <div style={S.card}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '16px',
                }}
              >
                💰 Monthly Net Savings
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Month', 'Income', 'Expense', 'Savings', 'Status'].map(
                      (h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {savingsReport.map((m) => (
                    <tr key={m.label}>
                      <td style={{ ...S.td, fontWeight: 600, color: C.text }}>
                        {m.label}
                      </td>
                      <td style={{ ...S.td, color: C.green, fontWeight: 600 }}>
                        {fmt(m.income)}
                      </td>
                      <td style={{ ...S.td, color: C.red, fontWeight: 600 }}>
                        {fmt(m.expense)}
                      </td>
                      <td
                        style={{
                          ...S.td,
                          fontWeight: 700,
                          color: m.savings >= 0 ? C.green : C.red,
                        }}
                      >
                        {fmt(m.savings)}
                      </td>
                      <td style={S.td}>
                        <span
                          style={{
                            ...S.badge,
                            ...(m.label === bestMonth?.label
                              ? {
                                  background: 'rgba(16,185,129,0.15)',
                                  color: C.green,
                                }
                              : m.label === worstMonth?.label
                                ? {
                                    background: 'rgba(239,68,68,0.15)',
                                    color: C.red,
                                  }
                                : {
                                    background: 'rgba(148,163,184,0.1)',
                                    color: C.sub,
                                  }),
                          }}
                        >
                          {m.label === bestMonth?.label
                            ? '🏆 Best'
                            : m.label === worstMonth?.label
                              ? '📉 Worst'
                              : 'Normal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── EXPORT ── */}
        {tab === 'export' && (
          <div style={{ maxWidth: '480px' }}>
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
