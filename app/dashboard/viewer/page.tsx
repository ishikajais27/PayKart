'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface FinRecord {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
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
      <div style={{ color: '#6366f1', fontSize: '16px' }}>Loading...</div>
    </div>
  )
}

export default function ViewerDashboard() {
  const { user, loading: authLoading, logout } = useAuth('VIEWER')
  const [records, setRecords] = useState<FinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [selected, setSelected] = useState<FinRecord | null>(null)

  useEffect(() => {
    if (user) fetchRecords()
  }, [user])

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

  const totalIncome = records
    .filter((r) => r.type === 'INCOME')
    .reduce((s, r) => s + r.amount, 0)
  const totalExpense = records
    .filter((r) => r.type === 'EXPENSE')
    .reduce((s, r) => s + r.amount, 0)
  const net = totalIncome - totalExpense

  if (authLoading) return <LoadingScreen />

  const s = pageStyles()

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={s.logo}>💰 PayKart</span>
          <span
            style={s.roleBadge(
              '#34d399',
              'rgba(16,185,129,0.15)',
              'rgba(16,185,129,0.25)',
            )}
          >
            VIEWER
          </span>
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
        <div style={{ marginBottom: '28px' }}>
          <h1 style={s.title}>My Financial Records</h1>
          <p style={{ color: '#64748b', fontSize: '15px', marginTop: '4px' }}>
            Read-only view of your financial data
          </p>
        </div>

        {/* STATS */}
        <div style={s.statsRow}>
          {[
            {
              label: 'Total Income',
              val: `₹${totalIncome.toLocaleString()}`,
              color: '#10b981',
              icon: '↑',
            },
            {
              label: 'Total Expenses',
              val: `₹${totalExpense.toLocaleString()}`,
              color: '#ef4444',
              icon: '↓',
            },
            {
              label: 'Net Balance',
              val: `₹${net.toLocaleString()}`,
              color: net >= 0 ? '#6366f1' : '#ef4444',
              icon: '=',
            },
          ].map((c) => (
            <div key={c.label} style={s.statCard(c.color)}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <p style={s.statLabel}>{c.label}</p>
                <span
                  style={{ fontSize: '20px', color: c.color, opacity: 0.7 }}
                >
                  {c.icon}
                </span>
              </div>
              <p
                style={{
                  fontSize: '26px',
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

        {/* FILTERS */}
        <div style={s.filterBox}>
          <div style={s.filterGroup}>
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
              fetchRecords(filterType, filterCategory, filterStart, filterEnd)
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

        {/* TABLE */}
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
              Transactions
            </span>
            <span style={{ color: '#64748b', fontSize: '13px' }}>
              {records.length} records
            </span>
          </div>
          {loading ? (
            <div
              style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}
            >
              Loading records...
            </div>
          ) : records.length === 0 ? (
            <div
              style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}
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
                    'Details',
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
                      background:
                        i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
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
                    <td style={{ ...s.td, color: '#64748b', fontSize: '13px' }}>
                      {r.notes || '—'}
                    </td>
                    <td style={s.td}>
                      <button onClick={() => setSelected(r)} style={s.viewBtn}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selected && (
        <div style={s.modalOverlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2
                style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: 700 }}
              >
                Transaction Details
              </h2>
              <button
                onClick={() => setSelected(null)}
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
            {[
              {
                label: 'Amount',
                val: `${selected.type === 'INCOME' ? '+' : '-'}₹${selected.amount.toLocaleString()}`,
                color: selected.type === 'INCOME' ? '#10b981' : '#ef4444',
              },
              { label: 'Type', val: selected.type },
              { label: 'Category', val: selected.category },
              {
                label: 'Date',
                val: new Date(selected.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }),
              },
              { label: 'Notes', val: selected.notes || 'No notes' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ color: '#64748b', fontSize: '14px' }}>
                  {item.label}
                </span>
                <span
                  style={{
                    color: item.color || '#f1f5f9',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {item.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function pageStyles() {
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
    roleBadge: (color: string, bg: string, border: string) =>
      ({
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '11px',
        fontWeight: 700,
        color,
        letterSpacing: '0.08em',
      }) as React.CSSProperties,
    logoutBtn: {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.2)',
      color: '#f87171',
      borderRadius: '8px',
      padding: '6px 14px',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: 500,
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
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    } as React.CSSProperties,
    statCard: (color: string) =>
      ({
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}25`,
        borderRadius: '14px',
        padding: '20px 24px',
      }) as React.CSSProperties,
    statLabel: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
    } as React.CSSProperties,
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
      background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
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
      background: 'rgba(99,102,241,0.15)',
      color: '#818cf8',
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
    viewBtn: {
      background: 'rgba(99,102,241,0.15)',
      color: '#818cf8',
      border: '1px solid rgba(99,102,241,0.2)',
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
