'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Nav,
  LoadingScreen,
  RecordsTable,
  styles,
} from '@/components/DashboardShared'

interface FinRecord {
  id: string
  amount: number
  type: string
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
interface TrendEntry {
  income: number
  expense: number
}

export default function AnalystDashboard() {
  const { user, loading: authLoading, logout } = useAuth('ANALYST')
  const [records, setRecords] = useState<FinRecord[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [trends, setTrends] = useState<Record<string, TrendEntry>>({})
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'records' | 'insights'>('records')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    type: 'INCOME',
    category: '',
    date: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    if (user) {
      fetchAll()
    }
  }, [user])
  useEffect(() => {
    if (user) fetchTrends()
  }, [period, user])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([fetchRecords(), fetchSummary(), fetchTrends()])
    setLoading(false)
  }

  async function fetchRecords(type = '', category = '') {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (category) params.set('category', category)
    const res = await fetch(`/api/records?${params}`)
    const json = await res.json()
    if (json.success) setRecords(json.data)
  }

  async function fetchSummary() {
    const res = await fetch('/api/dashboard/summary')
    const json = await res.json()
    if (json.success) setSummary(json.data)
  }

  async function fetchTrends() {
    const res = await fetch(`/api/dashboard/trends?period=${period}`)
    const json = await res.json()
    if (json.success) setTrends(json.data)
  }

  async function handleCreate() {
    setFormError('')
    if (!form.amount || !form.category || !form.date) {
      setFormError('Amount, category and date are required')
      return
    }
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    const json = await res.json()
    if (!json.success) {
      setFormError(json.message)
      return
    }
    setShowForm(false)
    setForm({ amount: '', type: 'INCOME', category: '', date: '', notes: '' })
    fetchAll()
  }

  if (authLoading) return <LoadingScreen />
  const s = styles()

  return (
    <div style={s.page}>
      <Nav
        name={user?.name || ''}
        role="ANALYST"
        roleColor="#818cf8"
        roleBg="rgba(99,102,241,0.15)"
        roleBorder="rgba(99,102,241,0.3)"
        onLogout={logout}
      />
      <div style={s.main}>
        <div
          style={{
            ...s.header,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h1 style={s.title}>Analyst Dashboard</h1>
            <p style={s.sub}>Manage records and view insights</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {showForm ? 'Cancel' : '+ Add Record'}
          </button>
        </div>

        {showForm && (
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '24px',
              marginBottom: '24px',
            }}
          >
            <h3
              style={{
                color: '#f1f5f9',
                marginBottom: '16px',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              New Record
            </h3>
            {formError && (
              <div
                style={{
                  color: '#f87171',
                  marginBottom: '12px',
                  fontSize: '14px',
                }}
              >
                {formError}
              </div>
            )}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { label: 'Amount', key: 'amount', type: 'number', ph: '0' },
                {
                  label: 'Category',
                  key: 'category',
                  type: 'text',
                  ph: 'Food, Salary...',
                },
                { label: 'Date', key: 'date', type: 'date', ph: '' },
                { label: 'Notes', key: 'notes', type: 'text', ph: 'Optional' },
              ].map(({ label, key, type, ph }) => (
                <div key={key}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={ph}
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#f1f5f9',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '4px',
                  }}
                >
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleCreate}
              style={{
                marginTop: '16px',
                padding: '10px 24px',
                background: 'linear-gradient(135deg,#10b981,#059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Save Record
            </button>
          </div>
        )}

        {summary && (
          <div style={s.statsRow}>
            {[
              {
                label: 'Total Income',
                val: `₹${summary.totalIncome.toLocaleString()}`,
                color: '#10b981',
              },
              {
                label: 'Total Expenses',
                val: `₹${summary.totalExpenses.toLocaleString()}`,
                color: '#ef4444',
              },
              {
                label: 'Net Balance',
                val: `₹${summary.netBalance.toLocaleString()}`,
                color: '#6366f1',
              },
            ].map((c) => (
              <div
                key={c.label}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${c.color}30`,
                  borderRadius: '14px',
                  padding: '20px 24px',
                }}
              >
                <p
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 500,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {c.label}
                </p>
                <p
                  style={{ fontSize: '26px', fontWeight: 700, color: c.color }}
                >
                  {c.val}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['records', 'insights'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'capitalize',
                background:
                  activeTab === tab
                    ? 'linear-gradient(135deg,#6366f1,#4f46e5)'
                    : 'rgba(255,255,255,0.05)',
                color: activeTab === tab ? '#fff' : '#64748b',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'records' && (
          <>
            <div style={s.filterBox}>
              <div>
                <label style={s.filterLabel}>Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={s.select}
                >
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div>
                <label style={s.filterLabel}>Category</label>
                <input
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  placeholder="e.g. Food"
                  style={s.input}
                />
              </div>
              <button
                onClick={() => fetchRecords(filterType, filterCategory)}
                style={s.filterBtn}
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setFilterType('')
                  setFilterCategory('')
                  fetchRecords()
                }}
                style={s.resetBtn}
              >
                Reset
              </button>
            </div>
            <RecordsTable records={records} loading={loading} />
          </>
        )}

        {activeTab === 'insights' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <h3
                  style={{
                    color: '#f1f5f9',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  Trends
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['monthly', 'weekly'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        background:
                          period === p
                            ? 'rgba(99,102,241,0.3)'
                            : 'rgba(255,255,255,0.05)',
                        color: period === p ? '#818cf8' : '#64748b',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {Object.entries(trends)
                  .slice(-6)
                  .map(([key, val]) => {
                    const max = Math.max(
                      ...Object.values(trends).flatMap((v) => [
                        v.income,
                        v.expense,
                      ]),
                      1,
                    )
                    return (
                      <div key={key}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '4px',
                          }}
                        >
                          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                            {key}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            ₹{val.income.toLocaleString()} in / ₹
                            {val.expense.toLocaleString()} out
                          </span>
                        </div>
                        <div
                          style={{ display: 'flex', gap: '4px', height: '6px' }}
                        >
                          <div
                            style={{
                              height: '6px',
                              width: `${(val.income / max) * 100}%`,
                              background: '#10b981',
                              borderRadius: '3px',
                            }}
                          />
                          <div
                            style={{
                              height: '6px',
                              width: `${(val.expense / max) * 100}%`,
                              background: '#ef4444',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {summary && Object.keys(summary.categoryTotals).length > 0 && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '24px',
                }}
              >
                <h3
                  style={{
                    color: '#f1f5f9',
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '16px',
                  }}
                >
                  Category Breakdown
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {Object.entries(summary.categoryTotals).map(([cat, amt]) => (
                    <div
                      key={cat}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#64748b',
                          marginBottom: '4px',
                        }}
                      >
                        {cat}
                      </p>
                      <p
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#f1f5f9',
                        }}
                      >
                        ₹{amt.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
