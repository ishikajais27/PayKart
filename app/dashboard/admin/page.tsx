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
  userId: string
}
interface AppUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}
interface Summary {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  categoryTotals: Record<string, number>
}

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth('ADMIN')
  const [records, setRecords] = useState<FinRecord[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [recentActivity, setRecentActivity] = useState<FinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'users'>(
    'overview',
  )
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    type: 'INCOME',
    category: '',
    date: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')
  const [editRecord, setEditRecord] = useState<FinRecord | null>(null)
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    if (user) fetchAll()
  }, [user])

  async function fetchAll() {
    setLoading(true)
    await Promise.all([
      fetchRecords(),
      fetchUsers(),
      fetchSummary(),
      fetchActivity(),
    ])
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

  async function fetchUsers() {
    const res = await fetch('/api/users')
    const json = await res.json()
    if (json.success) setUsers(json.data)
  }

  async function fetchSummary() {
    const res = await fetch('/api/dashboard/summary')
    const json = await res.json()
    if (json.success) setSummary(json.data)
  }

  async function fetchActivity() {
    const res = await fetch('/api/dashboard/activity')
    const json = await res.json()
    if (json.success) setRecentActivity(json.data)
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

  async function handleUpdate() {
    if (!editRecord) return
    setFormError('')
    const res = await fetch(`/api/records/${editRecord.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    const json = await res.json()
    if (!json.success) {
      setFormError(json.message)
      return
    }
    setEditRecord(null)
    setForm({ amount: '', type: 'INCOME', category: '', date: '', notes: '' })
    fetchAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this record?')) return
    await fetch(`/api/records/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  async function toggleUserStatus(u: AppUser) {
    await fetch(`/api/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !u.isActive }),
    })
    fetchUsers()
  }

  async function changeUserRole(u: AppUser, role: string) {
    await fetch(`/api/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    fetchUsers()
  }

  if (authLoading) return <LoadingScreen />
  const s = styles()

  const formFields = [
    { label: 'Amount', key: 'amount', type: 'number', ph: '0' },
    { label: 'Category', key: 'category', type: 'text', ph: 'Food, Salary...' },
    { label: 'Date', key: 'date', type: 'date', ph: '' },
    { label: 'Notes', key: 'notes', type: 'text', ph: 'Optional' },
  ]

  return (
    <div style={s.page}>
      <Nav
        name={user?.name || ''}
        role="ADMIN"
        roleColor="#f59e0b"
        roleBg="rgba(245,158,11,0.15)"
        roleBorder="rgba(245,158,11,0.3)"
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
            <h1 style={s.title}>Admin Dashboard</h1>
            <p style={s.sub}>Full control — records, users, insights</p>
          </div>
          {activeTab === 'records' && (
            <button
              onClick={() => {
                setShowForm(!showForm)
                setEditRecord(null)
                setForm({
                  amount: '',
                  type: 'INCOME',
                  category: '',
                  date: '',
                  notes: '',
                })
              }}
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
          )}
        </div>

        {(showForm || editRecord) && activeTab === 'records' && (
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
              {editRecord ? 'Edit Record' : 'New Record'}
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
              {formFields.map(({ label, key, type, ph }) => (
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
              onClick={editRecord ? handleUpdate : handleCreate}
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
              {editRecord ? 'Update Record' : 'Save Record'}
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
              {
                label: 'Total Records',
                val: records.length.toString(),
                color: '#f59e0b',
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
          {(['overview', 'records', 'users'] as const).map((tab) => (
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

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: '20px' }}>
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
                Recent Activity
              </h3>
              {recentActivity.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>
                  No recent activity
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {recentActivity.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: '14px',
                            color: '#e2e8f0',
                            fontWeight: 500,
                          }}
                        >
                          {r.category}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            marginLeft: '8px',
                          }}
                        >
                          {new Date(r.date).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: r.type === 'INCOME' ? '#34d399' : '#f87171',
                        }}
                      >
                        {r.type === 'INCOME' ? '+' : '-'}₹
                        {r.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '14px',
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <p
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  Loading...
                </p>
              ) : records.length === 0 ? (
                <p
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  No records found
                </p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {[
                        'Date',
                        'Type',
                        'Category',
                        'Amount',
                        'Notes',
                        'Actions',
                      ].map((h) => (
                        <th key={h} style={s.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id}>
                        <td style={s.td}>
                          {new Date(r.date).toLocaleDateString()}
                        </td>
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
                              color:
                                r.type === 'INCOME' ? '#34d399' : '#f87171',
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
                          }}
                        >
                          ₹{r.amount.toLocaleString()}
                        </td>
                        <td style={{ ...s.td, color: '#64748b' }}>
                          {r.notes || '—'}
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setEditRecord(r)
                                setForm({
                                  amount: String(r.amount),
                                  type: r.type,
                                  category: r.category,
                                  date: r.date.slice(0, 10),
                                  notes: r.notes || '',
                                })
                                setShowForm(false)
                              }}
                              style={{
                                padding: '4px 12px',
                                background: 'rgba(99,102,241,0.2)',
                                color: '#818cf8',
                                border: '1px solid rgba(99,102,241,0.3)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(r.id)}
                              style={{
                                padding: '4px 12px',
                                background: 'rgba(239,68,68,0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 500,
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <p
                style={{
                  padding: '32px',
                  textAlign: 'center',
                  color: '#64748b',
                }}
              >
                Loading...
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {[
                      'Name',
                      'Email',
                      'Role',
                      'Status',
                      'Joined',
                      'Actions',
                    ].map((h) => (
                      <th key={h} style={s.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td style={s.td}>{u.name}</td>
                      <td style={{ ...s.td, color: '#64748b' }}>{u.email}</td>
                      <td style={s.td}>
                        <select
                          value={u.role}
                          onChange={(e) => changeUserRole(u, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            color: '#f1f5f9',
                            fontSize: '13px',
                            outline: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td style={s.td}>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: u.isActive
                              ? 'rgba(16,185,129,0.15)'
                              : 'rgba(239,68,68,0.15)',
                            color: u.isActive ? '#34d399' : '#f87171',
                          }}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#64748b' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={s.td}>
                        <button
                          onClick={() => toggleUserStatus(u)}
                          style={{
                            padding: '4px 12px',
                            background: u.isActive
                              ? 'rgba(239,68,68,0.15)'
                              : 'rgba(16,185,129,0.15)',
                            color: u.isActive ? '#f87171' : '#34d399',
                            border: `1px solid ${u.isActive ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
