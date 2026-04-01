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

export default function ViewerDashboard() {
  const { user, loading: authLoading, logout } = useAuth('VIEWER')
  const [records, setRecords] = useState<FinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    if (user) fetchRecords()
  }, [user])

  async function fetchRecords(type = '', category = '') {
    setLoading(true)
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (category) params.set('category', category)
    const res = await fetch(`/api/records?${params}`)
    const json = await res.json()
    if (json.success) setRecords(json.data)
    setLoading(false)
  }

  const totalIncome = records
    .filter((r) => r.type === 'INCOME')
    .reduce((s, r) => s + r.amount, 0)
  const totalExpense = records
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + r.amount, 0)

  if (authLoading) return <LoadingScreen />

  const s = styles()

  return (
    <div style={s.page}>
      <Nav
        name={user?.name || ''}
        role="VIEWER"
        roleColor="#34d399"
        roleBg="rgba(16,185,129,0.15)"
        roleBorder="rgba(16,185,129,0.25)"
        onLogout={logout}
      />
      <div style={s.main}>
        <div style={s.header}>
          <h1 style={s.title}>My Records</h1>
          <p style={s.sub}>View your financial records — read only access</p>
        </div>

        <div style={s.statsRow}>
          {[
            {
              label: 'Total Income',
              val: `₹${totalIncome.toLocaleString()}`,
              color: '#10b981',
            },
            {
              label: 'Total Expenses',
              val: `₹${totalExpense.toLocaleString()}`,
              color: '#ef4444',
            },
            {
              label: 'Net Balance',
              val: `₹${(totalIncome - totalExpense).toLocaleString()}`,
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
              <p style={{ fontSize: '26px', fontWeight: 700, color: c.color }}>
                {c.val}
              </p>
            </div>
          ))}
        </div>

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
            Apply Filter
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
      </div>
    </div>
  )
}
