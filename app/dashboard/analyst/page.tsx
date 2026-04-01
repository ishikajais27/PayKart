'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface FinRecord {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
}

interface Summary {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  categoryTotals: Record<string, number>
}

interface TrendPoint {
  income: number
  expense: number
}

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1e',
      }}
    >
      <div style={{ color: '#f59e0b', fontSize: '16px' }}>Loading...</div>
    </div>
  )
}

export default function AnalystDashboard() {
  const { user, loading: authLoading, logout } = useAuth('ANALYST')
  const [records, setRecords] = useState<FinRecord[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [trends, setTrends] = useState<Record<string, TrendPoint>>({})
  const [recentActivity, setRecentActivity] = useState<FinRecord[]>([])
  const [trendPeriod, setTrendPeriod] = useState<'monthly' | 'weekly'>(
    'monthly',
  )
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    'overview' | 'transactions' | 'insights'
  >('overview')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [recRes, sumRes, trendRes, actRes] = await Promise.all([
      fetch('/api/records'),
      fetch('/api/dashboard/summary'),
      fetch(`/api/dashboard/trends?period=${trendPeriod}`),
      fetch('/api/dashboard/activity'),
    ])
    const [recJson, sumJson, trendJson, actJson] = await Promise.all([
      recRes.json(),
      sumRes.json(),
      trendRes.json(),
      actRes.json(),
    ])
    if (recJson.success) setRecords(recJson.data)
    if (sumJson.success) setSummary(sumJson.data)
    if (trendJson.success) setTrends(trendJson.data)
    if (actJson.success) setRecentActivity(actJson.data)
    setLoading(false)
  }, [user, trendPeriod])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function fetchRecords(type = '', category = '', start = '', end = '') {
    setLoading(true)
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (category) params.set('category', category)
    if (start) params.set('startDate', start)
    if (end) params.set('endDate', end)
    const res = await fetch(`/api/records?${params}`)
    const json = await res.json()
    if (json.success) setRecords(json.data)
    setLoading(false)
  }

  async function handleAddRecord() {
    setFormError('')
    if (!form.amount || !form.category || !form.date) {
      setFormError('Amount, category and date are required')
      return
    }
    setFormLoading(true)
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    const json = await res.json()
    if (!json.success) {
      setFormError(json.message)
      setFormLoading(false)
      return
    }
    setAddOpen(false)
    setForm({ amount: '', type: 'EXPENSE', category: '', date: '', notes: '' })
    fetchAll()
    setFormLoading(false)
  }

  async function handleEditRecord(id: string) {
    const rec = records.find((r) => r.id === id)
    if (!rec) return
    const newAmount = prompt('New amount:', String(rec.amount))
    const newNotes = prompt('New notes:', rec.notes || '')
    if (!newAmount) return
    await fetch(`/api/records/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(newAmount),
        notes: newNotes || '',
      }),
    })
    fetchAll()
  }

  const savings = summary
    ? ((summary.netBalance / (summary.totalIncome || 1)) * 100).toFixed(1)
    : '0'
  const topCategory = summary
    ? Object.entries(summary.categoryTotals).sort((a, b) => b[1] - a[1])[0]
    : null
  const trendEntries = Object.entries(trends).slice(-6)

  if (authLoading) return <LoadingScreen />
  const s = analystStyles()

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={s.logo}>💰 PayKart</span>
          <span style={s.roleBadge}>ANALYST</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(['overview', 'transactions', 'insights'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={s.tabBtn(activeTab === tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#94a3b8', fontSize: '14px' }}>
            {user?.name}
          </span>
          <button onClick={logout} style={s.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      <div style={s.main}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={s.title}>Analyst Dashboard</h1>
              <p
                style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}
              >
                Advanced financial insights & analytics
              </p>
            </div>

            {/* KPI CARDS */}
            <div style={s.statsRow}>
              {[
                {
                  label: 'Total Income',
                  val: `₹${(summary?.totalIncome || 0).toLocaleString()}`,
                  color: '#10b981',
                  sub: 'All credits',
                },
                {
                  label: 'Total Expenses',
                  val: `₹${(summary?.totalExpenses || 0).toLocaleString()}`,
                  color: '#ef4444',
                  sub: 'All debits',
                },
                {
                  label: 'Net Balance',
                  val: `₹${(summary?.netBalance || 0).toLocaleString()}`,
                  color:
                    (summary?.netBalance || 0) >= 0 ? '#6366f1' : '#ef4444',
                  sub: 'Income - Expenses',
                },
                {
                  label: 'Savings Rate',
                  val: `${savings}%`,
                  color: '#f59e0b',
                  sub: 'Of total income',
                },
              ].map((c) => (
                <div key={c.label} style={s.statCard(c.color)}>
                  <p style={s.statLabel}>{c.label}</p>
                  <p
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: c.color,
                      margin: '8px 0 4px',
                    }}
                  >
                    {c.val}
                  </p>
                  <p style={{ fontSize: '12px', color: '#475569' }}>{c.sub}</p>
                </div>
              ))}
            </div>

            {/* TREND CHART (visual bars) */}
            <div style={s.card}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h3 style={s.cardTitle}>Income vs Expense Trends</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['monthly', 'weekly'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setTrendPeriod(p)}
                      style={s.periodBtn(trendPeriod === p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {trendEntries.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '14px' }}>
                  No trend data available.
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-end',
                    height: '160px',
                  }}
                >
                  {trendEntries.map(([key, val]) => {
                    const max = Math.max(
                      ...trendEntries.map(([, v]) =>
                        Math.max(v.income, v.expense),
                      ),
                      1,
                    )
                    return (
                      <div
                        key={key}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          height: '100%',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            display: 'flex',
                            gap: '3px',
                            alignItems: 'flex-end',
                            height: '130px',
                          }}
                        >
                          <div
                            title={`Income: ₹${val.income}`}
                            style={{
                              flex: 1,
                              background: 'rgba(16,185,129,0.6)',
                              borderRadius: '4px 4px 0 0',
                              height: `${(val.income / max) * 100}%`,
                              minHeight: '4px',
                            }}
                          />
                          <div
                            title={`Expense: ₹${val.expense}`}
                            style={{
                              flex: 1,
                              background: 'rgba(239,68,68,0.6)',
                              borderRadius: '4px 4px 0 0',
                              height: `${(val.expense / max) * 100}%`,
                              minHeight: '4px',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            color: '#64748b',
                            textAlign: 'center',
                            wordBreak: 'break-all',
                          }}
                        >
                          {key.split('-').slice(1).join('-')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                <span style={{ fontSize: '12px', color: '#34d399' }}>
                  ■ Income
                </span>
                <span style={{ fontSize: '12px', color: '#f87171' }}>
                  ■ Expense
                </span>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div style={s.card}>
              <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>
                Recent Activity
              </h3>
              {recentActivity.slice(0, 8).map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>
                      {r.type === 'INCOME' ? '💚' : '🔴'}
                    </span>
                    <div>
                      <p
                        style={{
                          color: '#e2e8f0',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        {r.category}
                      </p>
                      <p style={{ color: '#475569', fontSize: '12px' }}>
                        {new Date(r.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      color: r.type === 'INCOME' ? '#10b981' : '#ef4444',
                      fontWeight: 700,
                      fontSize: '14px',
                    }}
                  >
                    {r.type === 'INCOME' ? '+' : '-'}₹
                    {r.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === 'transactions' && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h1 style={s.title}>Transactions</h1>
              <button onClick={() => setAddOpen(true)} style={s.addBtn}>
                + Add Record
              </button>
            </div>

            {/* FILTERS */}
            <div style={s.filterBox}>
              <div style={s.filterGroup}>
                <label style={s.filterLabel}>Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={s.select}
                >
                  <option value="">All</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div style={s.filterGroup}>
                <label style={s.filterLabel}>Category</label>
                <input
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  placeholder="e.g. Food"
                  style={s.input}
                />
              </div>
              <div style={s.filterGroup}>
                <label style={s.filterLabel}>From</label>
                <input
                  type="date"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                  style={s.input}
                />
              </div>
              <div style={s.filterGroup}>
                <label style={s.filterLabel}>To</label>
                <input
                  type="date"
                  value={filterEnd}
                  onChange={(e) => setFilterEnd(e.target.value)}
                  style={s.input}
                />
              </div>
              <button
                onClick={() =>
                  fetchRecords(
                    filterType,
                    filterCategory,
                    filterStart,
                    filterEnd,
                  )
                }
                style={s.filterBtn}
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setFilterType('')
                  setFilterCategory('')
                  setFilterStart('')
                  setFilterEnd('')
                  fetchRecords()
                }}
                style={s.resetBtn}
              >
                Reset
              </button>
            </div>

            <div style={s.tableWrap}>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>
                  All Records
                </span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>
                  {records.length} records
                </span>
              </div>
              {loading ? (
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  Loading...
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      {[
                        'Date',
                        'Category',
                        'Type',
                        'Amount',
                        'Notes',
                        'Edit',
                      ].map((h) => (
                        <th key={h} style={s.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background:
                            i % 2 === 0
                              ? 'transparent'
                              : 'rgba(255,255,255,0.01)',
                        }}
                      >
                        <td style={s.td}>
                          {new Date(r.date).toLocaleDateString('en-IN')}
                        </td>
                        <td style={s.td}>
                          <span style={s.categoryTag}>{r.category}</span>
                        </td>
                        <td style={s.td}>
                          <span style={s.typeBadge(r.type)}>{r.type}</span>
                        </td>
                        <td
                          style={{
                            ...s.td,
                            fontWeight: 600,
                            color: r.type === 'INCOME' ? '#10b981' : '#ef4444',
                          }}
                        >
                          {r.type === 'INCOME' ? '+' : '-'}₹
                          {r.amount.toLocaleString()}
                        </td>
                        <td
                          style={{
                            ...s.td,
                            color: '#64748b',
                            fontSize: '13px',
                          }}
                        >
                          {r.notes || '—'}
                        </td>
                        <td style={s.td}>
                          <button
                            onClick={() => handleEditRecord(r.id)}
                            style={s.editBtn}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={s.title}>Financial Insights</h1>
              <p
                style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}
              >
                Deep-dive analytics for better decisions
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
              {/* Category Breakdown */}
              <div style={s.card}>
                <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>
                  Category-wise Spending
                </h3>
                {summary &&
                  Object.entries(summary.categoryTotals)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, amt]) => {
                      const max = Math.max(
                        ...Object.values(summary.categoryTotals),
                      )
                      const pct = ((amt / max) * 100).toFixed(0)
                      return (
                        <div key={cat} style={{ marginBottom: '12px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{ color: '#e2e8f0', fontSize: '13px' }}
                            >
                              {cat}
                            </span>
                            <span
                              style={{
                                color: '#f59e0b',
                                fontSize: '13px',
                                fontWeight: 600,
                              }}
                            >
                              ₹{amt.toLocaleString()}
                            </span>
                          </div>
                          <div
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: '4px',
                              height: '6px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background:
                                  'linear-gradient(90deg,#f59e0b,#d97706)',
                                borderRadius: '4px',
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
              </div>

              {/* Summary Highlights */}
              <div style={s.card}>
                <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>
                  Summary Highlights
                </h3>
                {[
                  {
                    label: '🏆 Top Expense Category',
                    val: topCategory
                      ? `${topCategory[0]} (₹${topCategory[1].toLocaleString()})`
                      : 'N/A',
                    color: '#f87171',
                  },
                  {
                    label: '💰 Savings Rate',
                    val: `${savings}%`,
                    color: parseFloat(savings) >= 20 ? '#10b981' : '#f59e0b',
                  },
                  {
                    label: '📊 Total Records',
                    val: records.length.toString(),
                    color: '#818cf8',
                  },
                  {
                    label: '📈 Income Entries',
                    val: records
                      .filter((r) => r.type === 'INCOME')
                      .length.toString(),
                    color: '#34d399',
                  },
                  {
                    label: '📉 Expense Entries',
                    val: records
                      .filter((r) => r.type === 'EXPENSE')
                      .length.toString(),
                    color: '#f87171',
                  },
                  {
                    label: '⚡ Avg Transaction',
                    val: records.length
                      ? `₹${Math.round(records.reduce((s, r) => s + r.amount, 0) / records.length).toLocaleString()}`
                      : '₹0',
                    color: '#f59e0b',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        color: item.color,
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    >
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Monthly Trend Table */}
              <div style={{ ...s.card, gridColumn: '1 / -1' }}>
                <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>
                  Trend Table ({trendPeriod})
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Period', 'Income', 'Expense', 'Net', 'Savings %'].map(
                        (h) => (
                          <th key={h} style={s.th}>
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {trendEntries.map(([key, val]) => {
                      const net = val.income - val.expense
                      const savePct =
                        val.income > 0
                          ? ((net / val.income) * 100).toFixed(1)
                          : '0'
                      return (
                        <tr
                          key={key}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          <td style={s.td}>{key}</td>
                          <td
                            style={{
                              ...s.td,
                              color: '#10b981',
                              fontWeight: 600,
                            }}
                          >
                            ₹{val.income.toLocaleString()}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              color: '#ef4444',
                              fontWeight: 600,
                            }}
                          >
                            ₹{val.expense.toLocaleString()}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              color: net >= 0 ? '#6366f1' : '#ef4444',
                              fontWeight: 600,
                            }}
                          >
                            ₹{net.toLocaleString()}
                          </td>
                          <td
                            style={{
                              ...s.td,
                              color:
                                parseFloat(savePct) >= 20
                                  ? '#10b981'
                                  : '#f59e0b',
                            }}
                          >
                            {savePct}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ADD RECORD MODAL */}
      {addOpen && (
        <div style={s.modalOverlay} onClick={() => setAddOpen(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 700 }}
              >
                Add Transaction
              </h2>
              <button
                onClick={() => setAddOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            {formError && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {formError}
              </div>
            )}
            {[
              { label: 'Amount', key: 'amount', type: 'number', ph: '5000' },
              {
                label: 'Category',
                key: 'category',
                type: 'text',
                ph: 'Food, Salary, etc.',
              },
              { label: 'Date', key: 'date', type: 'date', ph: '' },
              {
                label: 'Notes',
                key: 'notes',
                type: 'text',
                ph: 'Optional note',
              },
            ].map((f) => (
              <div key={f.key} style={{ marginBottom: '14px' }}>
                <label style={s.filterLabel}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  placeholder={f.ph}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  style={{
                    ...s.input,
                    width: '100%',
                    boxSizing: 'border-box',
                    marginTop: '6px',
                  }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '20px' }}>
              <label style={s.filterLabel}>Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, type: e.target.value }))
                }
                style={{ ...s.select, width: '100%', marginTop: '6px' }}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
            <button
              onClick={handleAddRecord}
              disabled={formLoading}
              style={{ ...s.addBtn, width: '100%', padding: '12px' }}
            >
              {formLoading ? 'Saving...' : 'Add Transaction'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function analystStyles() {
  return {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 100%)',
      fontFamily: 'system-ui, sans-serif',
    } as React.CSSProperties,
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
      backdropFilter: 'blur(12px)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
    },
    logo: {
      color: '#f1f5f9',
      fontSize: '18px',
      fontWeight: 700,
    } as React.CSSProperties,
    roleBadge: {
      background: 'rgba(245,158,11,0.15)',
      border: '1px solid rgba(245,158,11,0.3)',
      borderRadius: '6px',
      padding: '3px 10px',
      fontSize: '11px',
      fontWeight: 700,
      color: '#fbbf24',
      letterSpacing: '0.08em',
    } as React.CSSProperties,
    tabBtn: (active: boolean) =>
      ({
        padding: '7px 16px',
        background: active ? 'rgba(245,158,11,0.2)' : 'transparent',
        color: active ? '#fbbf24' : '#64748b',
        border: active
          ? '1px solid rgba(245,158,11,0.3)'
          : '1px solid transparent',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
      }) as React.CSSProperties,
    logoutBtn: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.2)',
      color: '#f87171',
      borderRadius: '8px',
      padding: '6px 14px',
      fontSize: '13px',
      cursor: 'pointer',
    } as React.CSSProperties,
    main: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px',
    } as React.CSSProperties,
    title: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#f1f5f9',
    } as React.CSSProperties,
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    } as React.CSSProperties,
    statCard: (color: string) =>
      ({
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}25`,
        borderRadius: '14px',
        padding: '18px 20px',
      }) as React.CSSProperties,
    statLabel: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
    } as React.CSSProperties,
    card: {
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '20px 24px',
      marginBottom: '20px',
    } as React.CSSProperties,
    cardTitle: {
      color: '#f1f5f9',
      fontSize: '15px',
      fontWeight: 700,
    } as React.CSSProperties,
    periodBtn: (active: boolean) =>
      ({
        padding: '5px 12px',
        background: active ? 'rgba(245,158,11,0.2)' : 'transparent',
        color: active ? '#fbbf24' : '#64748b',
        border: `1px solid ${active ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
        fontWeight: 500,
      }) as React.CSSProperties,
    filterBox: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '12px',
      alignItems: 'flex-end',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '24px',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
    },
    filterLabel: {
      fontSize: '12px',
      color: '#94a3b8',
      fontWeight: 500,
    } as React.CSSProperties,
    select: {
      padding: '9px 12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '13px',
      outline: 'none',
    } as React.CSSProperties,
    input: {
      padding: '9px 12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '13px',
      outline: 'none',
    } as React.CSSProperties,
    filterBtn: {
      padding: '9px 18px',
      background: 'linear-gradient(135deg,#f59e0b,#d97706)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      alignSelf: 'flex-end',
    } as React.CSSProperties,
    resetBtn: {
      padding: '9px 18px',
      background: 'rgba(255,255,255,0.05)',
      color: '#94a3b8',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      fontSize: '13px',
      cursor: 'pointer',
      alignSelf: 'flex-end',
    } as React.CSSProperties,
    addBtn: {
      background: 'linear-gradient(135deg,#f59e0b,#d97706)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '9px 18px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
    } as React.CSSProperties,
    tableWrap: {
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '14px',
      overflow: 'hidden',
    } as React.CSSProperties,
    th: {
      padding: '12px 16px',
      textAlign: 'left' as const,
      fontSize: '12px',
      color: '#64748b',
      fontWeight: 600,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    td: {
      padding: '14px 16px',
      fontSize: '14px',
      color: '#e2e8f0',
    } as React.CSSProperties,
    categoryTag: {
      background: 'rgba(245,158,11,0.15)',
      color: '#fbbf24',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 500,
    } as React.CSSProperties,
    typeBadge: (type: string) =>
      ({
        background:
          type === 'INCOME' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
        color: type === 'INCOME' ? '#34d399' : '#f87171',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
      }) as React.CSSProperties,
    editBtn: {
      background: 'rgba(245,158,11,0.15)',
      color: '#fbbf24',
      border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: '6px',
      padding: '5px 12px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: 500,
    } as React.CSSProperties,
    modalOverlay: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      background: '#111827',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '28px',
      width: '100%',
      maxWidth: '420px',
    } as React.CSSProperties,
  }
}
