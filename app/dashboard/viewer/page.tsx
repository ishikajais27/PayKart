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

type Tab = 'dashboard' | 'records' | 'insights'
const NAV = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: '📊' },
  { id: 'records' as Tab, label: 'My Records', icon: '📋' },
  { id: 'insights' as Tab, label: 'Insights', icon: '💡' },
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
function badgeColor(v: string): React.CSSProperties {
  if (['INCOME', 'Transfer In'].includes(v))
    return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
  if (['EXPENSE'].includes(v))
    return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
  if (['Transfer Out'].includes(v))
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
  statCard: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center' as const,
  },
  alertBox: {
    background: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.2)',
    color: C.yellow,
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '12px',
  },
}

export default function ViewerDashboard() {
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
  const [savingsGoal, setSavingsGoal] = useState(20000)
  const [editGoal, setEditGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

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
  }, [filterType, filterCat, filterStart, filterEnd])

  useEffect(() => {
    setName(localStorage.getItem('name') || 'User')
    fetchMe()
  }, [])
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const allRows = useMemo(() => {
    const rows: {
      id: string
      type: 'INCOME' | 'EXPENSE'
      category: string
      amount: number
      date: string
      notes?: string
      source: string
    }[] = []
    records
      .filter((r) => !(r as any).deletedAt)
      .forEach((r) =>
        rows.push({
          id: r.id,
          type: r.type,
          category: r.category,
          amount: r.amount,
          date: r.date,
          notes: r.notes,
          source: 'Record',
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

  const now = new Date()
  const thisMonthRows = allRows.filter((r) => {
    const d = new Date(r.date)
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    )
  })
  const lastMonthRows = allRows.filter((r) => {
    const d = new Date(r.date)
    const lm = (now.getMonth() - 1 + 12) % 12
    const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return d.getMonth() === lm && d.getFullYear() === ly
  })
  const todayRows = allRows.filter(
    (r) => new Date(r.date).toDateString() === now.toDateString(),
  )
  const thisIncome = thisMonthRows
    .filter((r) => r.type === 'INCOME')
    .reduce((s, r) => s + r.amount, 0)
  const thisExpense = thisMonthRows
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + r.amount, 0)
  const lastIncome = lastMonthRows
    .filter((r) => r.type === 'INCOME')
    .reduce((s, r) => s + r.amount, 0)
  const lastExpense = lastMonthRows
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + r.amount, 0)
  const todaySpend = todayRows
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + r.amount, 0)
  const thisSavings = thisIncome - thisExpense
  const savingsPct = Math.min(
    Math.round((Math.max(thisSavings, 0) / savingsGoal) * 100),
    100,
  )
  const dailyAvg = thisExpense / (now.getDate() || 1)
  const spikeAlert = todaySpend > dailyAvg * 3 && dailyAvg > 0

  const catTotals = useMemo(() => {
    const m: Record<string, number> = {}
    thisMonthRows
      .filter((r) => r.type === 'EXPENSE')
      .forEach((r) => {
        m[r.category] = (m[r.category] || 0) + r.amount
      })
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [thisMonthRows])

  const dowSpend = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const m: Record<string, number> = {}
    allRows
      .filter((r) => r.type === 'EXPENSE')
      .forEach((r) => {
        const d = days[new Date(r.date).getDay()]
        m[d] = (m[d] || 0) + r.amount
      })
    return days.map((d) => ({ day: d, amount: m[d] || 0 }))
  }, [allRows])
  const maxDow = Math.max(...dowSpend.map((d) => d.amount), 1)
  const topDow = dowSpend.reduce(
    (a, b) => (b.amount > a.amount ? b : a),
    dowSpend[0],
  )
  const biggestExpense = thisMonthRows
    .filter((r) => r.type === 'EXPENSE')
    .sort((a, b) => b.amount - a.amount)[0]

  const monthlyTrend = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
        const label = d.toLocaleDateString('en-IN', {
          month: 'short',
          year: '2-digit',
        })
        const mRows = allRows.filter((r) => {
          const rd = new Date(r.date)
          return (
            rd.getMonth() === d.getMonth() &&
            rd.getFullYear() === d.getFullYear()
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
      }),
    [allRows],
  )
  const maxTrend = Math.max(
    ...monthlyTrend.flatMap((t) => [t.income, t.expense]),
    1,
  )

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
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: C.green,
                padding: '2px 8px',
                borderRadius: '5px',
                fontWeight: 700,
              }}
            >
              VIEWER
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
                Hi, {name} 👋
              </h1>
              <p style={{ color: C.muted, fontSize: '14px' }}>
                Here's your personal finance summary.
              </p>
            </div>

            {spikeAlert && (
              <div style={S.alertBox}>
                ⚠️ You've spent {fmt(todaySpend)} today —{' '}
                {Math.round(todaySpend / dailyAvg)}x your daily average
              </div>
            )}
            {thisSavings < 0 && (
              <div
                style={{
                  ...S.alertBox,
                  color: C.red,
                  borderColor: 'rgba(239,68,68,0.25)',
                  background: 'rgba(239,68,68,0.06)',
                }}
              >
                🔴 Expenses exceed income by {fmt(Math.abs(thisSavings))} this
                month
              </div>
            )}

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
                  label: 'Spent This Month',
                  value: fmt(thisExpense),
                  color: C.red,
                  icon: '📉',
                },
                {
                  label: 'Spent Today',
                  value: fmt(todaySpend),
                  color: C.yellow,
                  icon: '🗓️',
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
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
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

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '24px',
              }}
            >
              {/* Savings goal */}
              <div style={S.card}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <h2
                    style={{ fontSize: '16px', fontWeight: 700, color: C.text }}
                  >
                    🎯 Savings Goal
                  </h2>
                  <button
                    style={S.btnOutline}
                    onClick={() => {
                      setEditGoal(true)
                      setGoalInput(String(savingsGoal))
                    }}
                  >
                    Edit
                  </button>
                </div>
                {editGoal && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <input
                      style={{ ...S.input, flex: 1 }}
                      type="number"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder="Goal amount"
                    />
                    <button
                      style={S.btn}
                      onClick={() => {
                        setSavingsGoal(parseFloat(goalInput) || savingsGoal)
                        setEditGoal(false)
                      }}
                    >
                      Save
                    </button>
                  </div>
                )}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div
                    style={{
                      fontSize: '36px',
                      fontWeight: 800,
                      color: savingsPct >= 100 ? C.green : C.purple,
                    }}
                  >
                    {savingsPct}%
                  </div>
                  <div style={{ fontSize: '13px', color: C.muted }}>
                    {fmt(Math.max(thisSavings, 0))} of {fmt(savingsGoal)}
                  </div>
                </div>
                <div
                  style={{
                    height: '10px',
                    background: 'rgba(255,255,255,0.07)',
                    borderRadius: '5px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${savingsPct}%`,
                      background:
                        savingsPct >= 100
                          ? 'linear-gradient(90deg,#10b981,#34d399)'
                          : 'linear-gradient(90deg,#6366f1,#818cf8)',
                      borderRadius: '5px',
                      transition: 'width 0.5s',
                    }}
                  />
                </div>
                {savingsPct >= 100 && (
                  <div
                    style={{
                      marginTop: '10px',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: C.green,
                      fontWeight: 600,
                    }}
                  >
                    🎉 Goal reached! Great job!
                  </div>
                )}
              </div>

              {/* This vs last month */}
              <div style={S.card}>
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  📅 This vs Last Month
                </h2>
                {(['Income', 'Expense'] as const).map((type) => {
                  const k = type.toLowerCase() as 'income' | 'expense'
                  const thisVal = k === 'income' ? thisIncome : thisExpense
                  const lastVal = k === 'income' ? lastIncome : lastExpense
                  const diff = thisVal - lastVal
                  const isGood = type === 'Income' ? diff >= 0 : diff <= 0
                  return (
                    <div
                      key={type}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        padding: '14px',
                        marginBottom: '10px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          color: C.muted,
                          marginBottom: '6px',
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
                              fontSize: '16px',
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
                            marginTop: '6px',
                            fontSize: '12px',
                            color: isGood ? C.green : C.red,
                            fontWeight: 600,
                          }}
                        >
                          {diff >= 0 ? '▲' : '▼'} {fmt(Math.abs(diff))}{' '}
                          {isGood ? '✓ Better' : '✗ Worse'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Trend chart */}
            <div style={S.card}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '16px',
                }}
              >
                📊 6-Month Trend
              </h2>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-end',
                  height: '140px',
                  paddingBottom: '24px',
                  overflowX: 'auto',
                }}
              >
                {monthlyTrend.map((t) => {
                  const incH = Math.round((t.income / maxTrend) * 100)
                  const expH = Math.round((t.expense / maxTrend) * 100)
                  return (
                    <div
                      key={t.label}
                      style={{
                        flex: 1,
                        minWidth: '50px',
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
                            width: '18px',
                            height: `${incH || 4}px`,
                            background: 'rgba(52,211,153,0.75)',
                            borderRadius: '3px 3px 0 0',
                          }}
                        />
                        <div
                          title={fmt(t.expense)}
                          style={{
                            width: '18px',
                            height: `${expH || 4}px`,
                            background: 'rgba(248,113,113,0.75)',
                            borderRadius: '3px 3px 0 0',
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

            {/* Recent transactions */}
            <div style={S.card}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '16px',
                }}
              >
                ⚡ Recent Transactions
              </h2>
              {allRows.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: `1px solid rgba(255,255,255,0.05)`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background:
                          r.type === 'INCOME'
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(239,68,68,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}
                    >
                      {r.type === 'INCOME' ? '↑' : '↓'}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: C.text,
                        }}
                      >
                        {r.category}
                      </div>
                      <div style={{ fontSize: '12px', color: C.muted }}>
                        {r.notes ||
                          new Date(r.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: r.type === 'INCOME' ? C.green : C.red,
                    }}
                  >
                    {r.type === 'INCOME' ? '+' : '−'}
                    {fmt(r.amount)}
                  </div>
                </div>
              ))}
              {allRows.length === 0 && (
                <div
                  style={{
                    color: C.muted,
                    textAlign: 'center',
                    padding: '24px',
                  }}
                >
                  No transactions yet.
                </div>
              )}
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
              <div style={{ minWidth: '110px' }}>
                <label style={S.label}>Type</label>
                <select
                  style={S.input}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div style={{ minWidth: '130px' }}>
                <label style={S.label}>Category</label>
                <select
                  style={S.input}
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                >
                  <option value="">All</option>
                  {CATS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
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
                fontSize: '12px',
                color: '#475569',
                marginBottom: '12px',
              }}
            >
              {allRows.length} result{allRows.length !== 1 ? 's' : ''}
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
                    ].map((h) => (
                      <th key={h} style={S.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((row) => (
                    <tr key={row.id}>
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
                          maxWidth: '200px',
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
                    </tr>
                  ))}
                  {allRows.length === 0 && (
                    <tr>
                      <td
                        style={{
                          ...S.td,
                          textAlign: 'center',
                          color: C.muted,
                          padding: '48px',
                        }}
                        colSpan={6}
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

        {/* ── INSIGHTS ── */}
        {tab === 'insights' && (
          <>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: C.text,
                marginBottom: '24px',
              }}
            >
              💡 Your Insights
            </h2>

            {/* Top spending */}
            <div style={S.card}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '16px',
                }}
              >
                🏆 Top Spending This Month
              </h3>
              {catTotals.length === 0 ? (
                <div style={{ color: C.muted }}>
                  No expense data this month.
                </div>
              ) : (
                catTotals.map(([cat, total], i) => (
                  <div
                    key={cat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '14px',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: [
                          '#fbbf24',
                          '#94a3b8',
                          '#cd7c3e',
                          '#6366f1',
                          '#10b981',
                        ][i],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#0a0f1e',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '14px',
                            color: C.text,
                            fontWeight: 600,
                          }}
                        >
                          {cat}
                        </span>
                        <span
                          style={{
                            fontSize: '14px',
                            color: C.red,
                            fontWeight: 700,
                          }}
                        >
                          {fmt(total)}
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
                            width: `${Math.round((total / (catTotals[0][1] || 1)) * 100)}%`,
                            background: [
                              '#fbbf24',
                              '#94a3b8',
                              '#cd7c3e',
                              '#6366f1',
                              '#10b981',
                            ][i],
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
              {/* Biggest expense */}
              <div style={S.card}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  💥 Biggest Expense This Month
                </h3>
                {biggestExpense ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(239,68,68,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      💸
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '22px',
                          fontWeight: 800,
                          color: C.red,
                        }}
                      >
                        {fmt(biggestExpense.amount)}
                      </div>
                      <div style={{ fontSize: '13px', color: C.muted }}>
                        {biggestExpense.category} ·{' '}
                        {new Date(biggestExpense.date).toLocaleDateString(
                          'en-IN',
                          { day: '2-digit', month: 'short' },
                        )}
                      </div>
                      {biggestExpense.notes && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#475569',
                            marginTop: '2px',
                          }}
                        >
                          {biggestExpense.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: C.muted }}>No expenses this month.</div>
                )}
              </div>

              {/* Day of week pattern */}
              <div style={S.card}>
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: '16px',
                  }}
                >
                  📆 Spending by Day of Week
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-end',
                    height: '100px',
                    paddingBottom: '20px',
                  }}
                >
                  {dowSpend.map((d) => {
                    const h = Math.round((d.amount / maxDow) * 70)
                    const isTop = d.day === topDow?.day
                    return (
                      <div
                        key={d.day}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <div
                          title={fmt(d.amount)}
                          style={{
                            width: '100%',
                            height: `${h || 4}px`,
                            background: isTop ? C.red : 'rgba(99,102,241,0.5)',
                            borderRadius: '3px 3px 0 0',
                            transition: 'height 0.4s',
                          }}
                        />
                        <div
                          style={{
                            fontSize: '10px',
                            color: isTop ? C.red : C.muted,
                            fontWeight: isTop ? 700 : 400,
                          }}
                        >
                          {d.day}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {topDow && topDow.amount > 0 && (
                  <div style={{ fontSize: '13px', color: C.sub }}>
                    You spend most on{' '}
                    <strong style={{ color: C.red }}>{topDow.day}s</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Income vs Expense bar */}
            <div style={S.card}>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: '16px',
                }}
              >
                📊 Income vs Expense This Month
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-end',
                  height: '120px',
                  marginBottom: '12px',
                }}
              >
                {[
                  { label: 'Income', val: thisIncome, color: C.green },
                  { label: 'Expense', val: thisExpense, color: C.red },
                ].map((b) => {
                  const max = Math.max(thisIncome, thisExpense, 1)
                  return (
                    <div
                      key={b.label}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          color: b.color,
                          fontWeight: 700,
                        }}
                      >
                        {fmt(b.val)}
                      </div>
                      <div
                        style={{
                          width: '60%',
                          height: `${Math.round((b.val / max) * 80) || 4}px`,
                          background: b.color,
                          borderRadius: '6px 6px 0 0',
                          opacity: 0.85,
                          transition: 'height 0.5s',
                        }}
                      />
                      <div style={{ fontSize: '12px', color: C.muted }}>
                        {b.label}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: thisSavings >= 0 ? C.green : C.red,
                  fontWeight: 600,
                }}
              >
                Net this month: {fmt(thisSavings)}{' '}
                {thisSavings >= 0 ? '✓' : '✗'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
