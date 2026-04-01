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
  userId: string
}

interface AppUser {
  id: string
  name: string
  email: string
  role: 'VIEWER' | 'ANALYST' | 'ADMIN'
  isActive: boolean
  createdAt: string
}

interface Summary {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  categoryTotals: Record<string, number>
}

type Tab = 'overview' | 'records' | 'users'

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0f1e',
        fontFamily: 'system-ui',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚙️</div>
        <div style={{ color: '#f59e0b', fontSize: '16px', fontWeight: 600 }}>
          Loading Admin Panel...
        </div>
      </div>
    </div>
  )
}

function Toast({ message }: { message: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        background: 'rgba(16,185,129,0.15)',
        border: '1px solid rgba(16,185,129,0.4)',
        color: '#34d399',
        padding: '12px 20px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 500,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      ✓ {message}
    </div>
  )
}

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth('ADMIN')

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [records, setRecords] = useState<FinRecord[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [recentActivity, setRecentActivity] = useState<FinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  // Record filters
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')

  // Record form
  const [showForm, setShowForm] = useState(false)
  const [editRecord, setEditRecord] = useState<FinRecord | null>(null)
  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    date: '',
    notes: '',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  // User form
  const [showUserForm, setShowUserForm] = useState(false)
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER',
  })
  const [userFormError, setUserFormError] = useState('')
  const [userFormLoading, setUserFormLoading] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchRecords = useCallback(
    async (type = '', category = '', start = '', end = '') => {
      const params = new URLSearchParams()
      if (type) params.set('type', type)
      if (category) params.set('category', category)
      if (start) params.set('startDate', start)
      if (end) params.set('endDate', end)
      const res = await fetch(`/api/records?${params}`)
      const json = await res.json()
      if (json.success) setRecords(json.data)
    },
    [],
  )

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/users')
    const json = await res.json()
    if (json.success) setUsers(json.data)
  }, [])

  const fetchSummary = useCallback(async () => {
    const res = await fetch('/api/dashboard/summary')
    const json = await res.json()
    if (json.success) setSummary(json.data)
  }, [])

  const fetchActivity = useCallback(async () => {
    const res = await fetch('/api/dashboard/activity')
    const json = await res.json()
    if (json.success) setRecentActivity(json.data)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchRecords(),
      fetchUsers(),
      fetchSummary(),
      fetchActivity(),
    ])
    setLoading(false)
  }, [fetchRecords, fetchUsers, fetchSummary, fetchActivity])

  useEffect(() => {
    if (user) fetchAll()
  }, [user, fetchAll])

  // ── Record CRUD ─────────────────────────────────────────────
  function openAddRecord() {
    setEditRecord(null)
    setForm({ amount: '', type: 'EXPENSE', category: '', date: '', notes: '' })
    setFormError('')
    setShowForm(true)
  }

  function openEditRecord(r: FinRecord) {
    setEditRecord(r)
    setForm({
      amount: String(r.amount),
      type: r.type,
      category: r.category,
      date: r.date.slice(0, 10),
      notes: r.notes || '',
    })
    setFormError('')
    setShowForm(true)
  }

  async function handleSaveRecord() {
    setFormError('')
    if (!form.amount || !form.category || !form.date) {
      setFormError('Amount, category and date are required')
      return
    }
    setFormLoading(true)
    const url = editRecord ? `/api/records/${editRecord.id}` : '/api/records'
    const method = editRecord ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
    const json = await res.json()
    setFormLoading(false)
    if (!json.success) {
      setFormError(json.message)
      return
    }
    setShowForm(false)
    setEditRecord(null)
    showToast(
      editRecord ? 'Record updated successfully' : 'Record added successfully',
    )
    fetchAll()
  }

  async function handleDeleteRecord(id: string) {
    if (!confirm('Permanently delete this record?')) return
    await fetch(`/api/records/${id}`, { method: 'DELETE' })
    showToast('Record deleted')
    fetchAll()
  }

  // ── User Management ─────────────────────────────────────────
  async function handleCreateUser() {
    setUserFormError('')
    if (!userForm.name || !userForm.email || !userForm.password) {
      setUserFormError('Name, email and password are required')
      return
    }
    setUserFormLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userForm),
    })
    const json = await res.json()
    setUserFormLoading(false)
    if (!json.success) {
      setUserFormError(json.message)
      return
    }

    // If role is not VIEWER, update it immediately after register
    if (userForm.role !== 'VIEWER') {
      const userId = json.data.user.id
      await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: userForm.role }),
      })
    }

    setShowUserForm(false)
    setUserForm({ name: '', email: '', password: '', role: 'VIEWER' })
    showToast('User created successfully')
    fetchUsers()
  }

  async function handleRoleChange(u: AppUser, role: string) {
    if (u.id === user?.id && role !== 'ADMIN') {
      alert('You cannot change your own role')
      return
    }
    await fetch(`/api/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    showToast(`Role updated to ${role}`)
    fetchUsers()
  }

  async function handleToggleActive(u: AppUser) {
    if (u.id === user?.id) {
      alert('You cannot deactivate your own account')
      return
    }
    await fetch(`/api/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !u.isActive }),
    })
    showToast(u.isActive ? 'User deactivated' : 'User activated')
    fetchUsers()
  }

  if (authLoading) return <LoadingScreen />

  const savings =
    summary && summary.totalIncome > 0
      ? ((summary.netBalance / summary.totalIncome) * 100).toFixed(1)
      : '0'

  const topCategory = summary
    ? Object.entries(summary.categoryTotals).sort((a, b) => b[1] - a[1])[0]
    : null

  const roleColor = (role: string) => {
    if (role === 'ADMIN')
      return {
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.15)',
        border: 'rgba(245,158,11,0.3)',
      }
    if (role === 'ANALYST')
      return {
        color: '#818cf8',
        bg: 'rgba(99,102,241,0.15)',
        border: 'rgba(99,102,241,0.3)',
      }
    return {
      color: '#34d399',
      bg: 'rgba(16,185,129,0.15)',
      border: 'rgba(16,185,129,0.3)',
    }
  }

  const s = adminStyles()

  return (
    <div style={s.page}>
      {toast && <Toast message={toast} />}

      {/* NAV */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={s.logo}>💰 PayKart</span>
          <span style={s.roleBadge}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(['overview', 'records', 'users'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={s.tabBtn(activeTab === tab)}
            >
              {tab === 'overview'
                ? '📊 Overview'
                : tab === 'records'
                  ? '📋 Records'
                  : '👥 Users'}
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
        {/* ── OVERVIEW TAB ────────────────────────────────── */}
        {activeTab === 'overview' && (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={s.title}>Admin Control Center</h1>
              <p
                style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}
              >
                Full system access — users, records, insights
              </p>
            </div>

            {/* KPI CARDS */}
            <div style={s.statsRow}>
              {[
                {
                  label: 'Total Income',
                  val: `₹${(summary?.totalIncome || 0).toLocaleString()}`,
                  color: '#10b981',
                  icon: '↑',
                },
                {
                  label: 'Total Expenses',
                  val: `₹${(summary?.totalExpenses || 0).toLocaleString()}`,
                  color: '#ef4444',
                  icon: '↓',
                },
                {
                  label: 'Net Balance',
                  val: `₹${(summary?.netBalance || 0).toLocaleString()}`,
                  color:
                    (summary?.netBalance || 0) >= 0 ? '#6366f1' : '#ef4444',
                  icon: '=',
                },
                {
                  label: 'Savings Rate',
                  val: `${savings}%`,
                  color: '#f59e0b',
                  icon: '💰',
                },
                {
                  label: 'Total Records',
                  val: records.length.toString(),
                  color: '#818cf8',
                  icon: '📋',
                },
                {
                  label: 'Total Users',
                  val: users.length.toString(),
                  color: '#34d399',
                  icon: '👥',
                },
              ].map((c) => (
                <div key={c.label} style={s.statCard(c.color)}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <p style={s.statLabel}>{c.label}</p>
                    <span style={{ fontSize: '16px' }}>{c.icon}</span>
                  </div>
                  <p
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: c.color,
                      marginTop: '8px',
                    }}
                  >
                    {c.val}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}
            >
              {/* RECENT ACTIVITY FEED */}
              <div style={s.card}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <h3 style={s.cardTitle}>⭐ Recent Activity</h3>
                  <span style={{ fontSize: '12px', color: '#475569' }}>
                    Last 5 transactions
                  </span>
                </div>
                {recentActivity.slice(0, 5).map((r, i) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      marginBottom: '8px',
                      background:
                        i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.2s',
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
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          background:
                            r.type === 'INCOME'
                              ? 'rgba(16,185,129,0.15)'
                              : 'rgba(239,68,68,0.1)',
                        }}
                      >
                        {r.type === 'INCOME' ? '💚' : '🔴'}
                      </div>
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
                          {new Date(r.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p
                        style={{
                          color: r.type === 'INCOME' ? '#10b981' : '#ef4444',
                          fontWeight: 700,
                          fontSize: '15px',
                        }}
                      >
                        {r.type === 'INCOME' ? '+' : '-'}₹
                        {r.amount.toLocaleString()}
                      </p>
                      <p
                        style={{
                          fontSize: '11px',
                          color:
                            r.type === 'INCOME'
                              ? 'rgba(16,185,129,0.6)'
                              : 'rgba(239,68,68,0.6)',
                        }}
                      >
                        {r.type}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p style={{ color: '#475569', fontSize: '14px' }}>
                    No recent activity
                  </p>
                )}
              </div>

              {/* SYSTEM HIGHLIGHTS */}
              <div style={s.card}>
                <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>
                  ⚙️ System Highlights
                </h3>
                {[
                  {
                    label: '🏆 Top Category',
                    val: topCategory ? `${topCategory[0]}` : 'N/A',
                    sub: topCategory
                      ? `₹${topCategory[1].toLocaleString()}`
                      : '',
                    color: '#f59e0b',
                  },
                  {
                    label: '👥 Active Users',
                    val: users.filter((u) => u.isActive).length.toString(),
                    sub: `of ${users.length} total`,
                    color: '#34d399',
                  },
                  {
                    label: '🔒 Inactive Users',
                    val: users.filter((u) => !u.isActive).length.toString(),
                    sub: 'deactivated accounts',
                    color: '#f87171',
                  },
                  {
                    label: '📊 Analysts',
                    val: users
                      .filter((u) => u.role === 'ANALYST')
                      .length.toString(),
                    sub: 'analyst role users',
                    color: '#818cf8',
                  },
                  {
                    label: '👁 Viewers',
                    val: users
                      .filter((u) => u.role === 'VIEWER')
                      .length.toString(),
                    sub: 'viewer role users',
                    color: '#64748b',
                  },
                  {
                    label: '📈 Income Records',
                    val: records
                      .filter((r) => r.type === 'INCOME')
                      .length.toString(),
                    sub: `vs ${records.filter((r) => r.type === 'EXPENSE').length} expenses`,
                    color: '#10b981',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div>
                      <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                        {item.label}
                      </p>
                      {item.sub && (
                        <p
                          style={{
                            color: '#475569',
                            fontSize: '11px',
                            marginTop: '2px',
                          }}
                        >
                          {item.sub}
                        </p>
                      )}
                    </div>
                    <span
                      style={{
                        color: item.color,
                        fontWeight: 700,
                        fontSize: '18px',
                      }}
                    >
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* CATEGORY BREAKDOWN */}
              {summary && Object.keys(summary.categoryTotals).length > 0 && (
                <div style={{ ...s.card, gridColumn: '1 / -1' }}>
                  <h3 style={{ ...s.cardTitle, marginBottom: '16px' }}>
                    📊 Category Breakdown (All Users)
                  </h3>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    {Object.entries(summary.categoryTotals)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, amt]) => {
                        const max = Math.max(
                          ...Object.values(summary.categoryTotals),
                        )
                        const pct = ((amt / max) * 100).toFixed(0)
                        return (
                          <div
                            key={cat}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              borderRadius: '10px',
                              padding: '14px 16px',
                              border: '1px solid rgba(255,255,255,0.05)',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                              }}
                            >
                              <span
                                style={{
                                  color: '#e2e8f0',
                                  fontSize: '13px',
                                  fontWeight: 500,
                                }}
                              >
                                {cat}
                              </span>
                              <span
                                style={{
                                  color: '#f59e0b',
                                  fontSize: '13px',
                                  fontWeight: 700,
                                }}
                              >
                                ₹{amt.toLocaleString()}
                              </span>
                            </div>
                            <div
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '4px',
                                height: '5px',
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
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── RECORDS TAB ─────────────────────────────────── */}
        {activeTab === 'records' && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div>
                <h1 style={s.title}>Transaction Management</h1>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '14px',
                    marginTop: '4px',
                  }}
                >
                  Full CRUD — view, add, edit, delete all records
                </p>
              </div>
              <button onClick={openAddRecord} style={s.primaryBtn}>
                + Add Record
              </button>
            </div>

            {/* RECORD FORM MODAL */}
            {showForm && (
              <div style={s.modalOverlay} onClick={() => setShowForm(false)}>
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
                      style={{
                        color: '#f1f5f9',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      {editRecord ? '✏️ Edit Record' : '➕ Add Record'}
                    </h2>
                    <button
                      onClick={() => setShowForm(false)}
                      style={s.closeBtn}
                    >
                      ✕
                    </button>
                  </div>
                  {formError && <div style={s.errorBox}>{formError}</div>}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '14px',
                    }}
                  >
                    {[
                      {
                        label: 'Amount',
                        key: 'amount',
                        type: 'number',
                        ph: '5000',
                      },
                      {
                        label: 'Category',
                        key: 'category',
                        type: 'text',
                        ph: 'Food, Salary...',
                      },
                      { label: 'Date', key: 'date', type: 'date', ph: '' },
                      {
                        label: 'Notes',
                        key: 'notes',
                        type: 'text',
                        ph: 'Optional note',
                      },
                    ].map((f) => (
                      <div key={f.key}>
                        <label style={s.fieldLabel}>{f.label}</label>
                        <input
                          type={f.type}
                          placeholder={f.ph}
                          value={form[f.key as keyof typeof form]}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              [f.key]: e.target.value,
                            }))
                          }
                          style={s.fieldInput}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={s.fieldLabel}>Type</label>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, type: e.target.value }))
                        }
                        style={s.fieldSelect}
                      >
                        <option value="EXPENSE">Expense</option>
                        <option value="INCOME">Income</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveRecord}
                    disabled={formLoading}
                    style={{
                      ...s.primaryBtn,
                      width: '100%',
                      marginTop: '20px',
                      padding: '12px',
                    }}
                  >
                    {formLoading
                      ? 'Saving...'
                      : editRecord
                        ? 'Update Record'
                        : 'Save Record'}
                  </button>
                </div>
              </div>
            )}

            {/* FILTERS */}
            <div style={s.filterBox}>
              <div style={s.filterGroup}>
                <label style={s.fieldLabel}>Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  style={s.filterSelect}
                >
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div style={s.filterGroup}>
                <label style={s.fieldLabel}>Category</label>
                <input
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  placeholder="e.g. Food"
                  style={s.filterInput}
                />
              </div>
              <div style={s.filterGroup}>
                <label style={s.fieldLabel}>From</label>
                <input
                  type="date"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                  style={s.filterInput}
                />
              </div>
              <div style={s.filterGroup}>
                <label style={s.fieldLabel}>To</label>
                <input
                  type="date"
                  value={filterEnd}
                  onChange={(e) => setFilterEnd(e.target.value)}
                  style={s.filterInput}
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
                style={s.applyBtn}
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

            {/* RECORDS TABLE */}
            <div style={s.tableWrap}>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>
                  All Transactions
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
                  Loading records...
                </div>
              ) : records.length === 0 ? (
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#64748b',
                  }}
                >
                  No records found
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
                        'Actions',
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
                            fontWeight: 700,
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
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => openEditRecord(r)}
                              style={s.editBtn}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(r.id)}
                              style={s.deleteBtn}
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

        {/* ── USERS TAB ───────────────────────────────────── */}
        {activeTab === 'users' && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <div>
                <h1 style={s.title}>User Management</h1>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '14px',
                    marginTop: '4px',
                  }}
                >
                  Create users, assign roles, activate / deactivate accounts
                </p>
              </div>
              <button
                onClick={() => {
                  setShowUserForm(true)
                  setUserFormError('')
                }}
                style={s.primaryBtn}
              >
                + Create User
              </button>
            </div>

            {/* CREATE USER MODAL */}
            {showUserForm && (
              <div
                style={s.modalOverlay}
                onClick={() => setShowUserForm(false)}
              >
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
                      style={{
                        color: '#f1f5f9',
                        fontSize: '18px',
                        fontWeight: 700,
                      }}
                    >
                      👤 Create New User
                    </h2>
                    <button
                      onClick={() => setShowUserForm(false)}
                      style={s.closeBtn}
                    >
                      ✕
                    </button>
                  </div>
                  {userFormError && (
                    <div style={s.errorBox}>{userFormError}</div>
                  )}
                  {[
                    {
                      label: 'Full Name',
                      key: 'name',
                      type: 'text',
                      ph: 'John Doe',
                    },
                    {
                      label: 'Email',
                      key: 'email',
                      type: 'email',
                      ph: 'john@example.com',
                    },
                    {
                      label: 'Password',
                      key: 'password',
                      type: 'password',
                      ph: '••••••••',
                    },
                  ].map((f) => (
                    <div key={f.key} style={{ marginBottom: '14px' }}>
                      <label style={s.fieldLabel}>{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.ph}
                        value={userForm[f.key as keyof typeof userForm]}
                        onChange={(e) =>
                          setUserForm((prev) => ({
                            ...prev,
                            [f.key]: e.target.value,
                          }))
                        }
                        style={{
                          ...s.fieldInput,
                          width: '100%',
                          boxSizing: 'border-box' as const,
                        }}
                      />
                    </div>
                  ))}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={s.fieldLabel}>Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      style={{
                        ...s.fieldSelect,
                        width: '100%',
                        marginTop: '6px',
                      }}
                    >
                      <option value="VIEWER">VIEWER</option>
                      <option value="ANALYST">ANALYST</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCreateUser}
                    disabled={userFormLoading}
                    style={{ ...s.primaryBtn, width: '100%', padding: '12px' }}
                  >
                    {userFormLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            )}

            {/* USERS TABLE */}
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
                  All Users
                </span>
                <span style={{ color: '#64748b', fontSize: '13px' }}>
                  {users.length} users ·{' '}
                  {users.filter((u) => u.isActive).length} active
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
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
                  {users.map((u, i) => {
                    const rc = roleColor(u.role)
                    const isSelf = u.id === user?.id
                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background:
                            i % 2 === 0
                              ? 'transparent'
                              : 'rgba(255,255,255,0.01)',
                        }}
                      >
                        <td style={s.td}>
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
                                background: `${rc.bg}`,
                                border: `1px solid ${rc.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: rc.color,
                              }}
                            >
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p
                                style={{
                                  color: '#e2e8f0',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                }}
                              >
                                {u.name}
                              </p>
                              {isSelf && (
                                <p
                                  style={{ color: '#f59e0b', fontSize: '11px' }}
                                >
                                  You
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...s.td, color: '#64748b' }}>{u.email}</td>
                        <td style={s.td}>
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u, e.target.value)
                            }
                            disabled={isSelf}
                            style={{
                              padding: '5px 10px',
                              background: rc.bg,
                              border: `1px solid ${rc.border}`,
                              borderRadius: '6px',
                              color: rc.color,
                              fontSize: '12px',
                              fontWeight: 700,
                              outline: 'none',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              opacity: isSelf ? 0.6 : 1,
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
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: u.isActive
                                ? 'rgba(16,185,129,0.15)'
                                : 'rgba(239,68,68,0.1)',
                              color: u.isActive ? '#34d399' : '#f87171',
                            }}
                          >
                            {u.isActive ? '● Active' : '○ Inactive'}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: '#64748b' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={s.td}>
                          <button
                            onClick={() => handleToggleActive(u)}
                            disabled={isSelf}
                            style={{
                              padding: '5px 14px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                              opacity: isSelf ? 0.4 : 1,
                              background: u.isActive
                                ? 'rgba(239,68,68,0.1)'
                                : 'rgba(16,185,129,0.15)',
                              color: u.isActive ? '#f87171' : '#34d399',
                              border: `1px solid ${u.isActive ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
                            }}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function adminStyles() {
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
      border: '1px solid rgba(245,158,11,0.35)',
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
        background: active
          ? 'linear-gradient(135deg,#f59e0b,#d97706)'
          : 'rgba(255,255,255,0.04)',
        color: active ? '#fff' : '#64748b',
        border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
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
      maxWidth: '1280px',
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
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '14px',
      marginBottom: '24px',
    } as React.CSSProperties,
    statCard: (color: string) =>
      ({
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}25`,
        borderRadius: '12px',
        padding: '16px 18px',
      }) as React.CSSProperties,
    statLabel: {
      fontSize: '11px',
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
    filterBox: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '12px',
      alignItems: 'flex-end',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '18px 20px',
      marginBottom: '20px',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
    },
    filterSelect: {
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '13px',
      outline: 'none',
    } as React.CSSProperties,
    filterInput: {
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '13px',
      outline: 'none',
    } as React.CSSProperties,
    applyBtn: {
      padding: '8px 18px',
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
      padding: '8px 18px',
      background: 'rgba(255,255,255,0.04)',
      color: '#94a3b8',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      fontSize: '13px',
      cursor: 'pointer',
      alignSelf: 'flex-end',
    } as React.CSSProperties,
    primaryBtn: {
      background: 'linear-gradient(135deg,#f59e0b,#d97706)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
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
      fontSize: '11px',
      color: '#64748b',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      background: 'rgba(255,255,255,0.02)',
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
      background: 'rgba(99,102,241,0.15)',
      color: '#818cf8',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: '6px',
      padding: '5px 12px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: 500,
    } as React.CSSProperties,
    deleteBtn: {
      background: 'rgba(239,68,68,0.1)',
      color: '#f87171',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: '6px',
      padding: '5px 12px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: 500,
    } as React.CSSProperties,
    modalOverlay: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      background: '#0f172a',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      padding: '28px',
      width: '100%',
      maxWidth: '480px',
    } as React.CSSProperties,
    closeBtn: {
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#94a3b8',
      borderRadius: '6px',
      width: '30px',
      height: '30px',
      cursor: 'pointer',
      fontSize: '14px',
    } as React.CSSProperties,
    errorBox: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      color: '#f87171',
      padding: '10px 14px',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '16px',
    } as React.CSSProperties,
    fieldLabel: {
      display: 'block',
      fontSize: '12px',
      color: '#94a3b8',
      fontWeight: 500,
      marginBottom: '6px',
    } as React.CSSProperties,
    fieldInput: {
      width: '100%',
      padding: '9px 12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '13px',
      outline: 'none',
      boxSizing: 'border-box' as const,
    } as React.CSSProperties,
    fieldSelect: {
      padding: '9px 12px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      color: '#f1f5f9',
      fontSize: '13px',
      outline: 'none',
    } as React.CSSProperties,
  }
}
