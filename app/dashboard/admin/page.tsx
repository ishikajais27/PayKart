// 'use client'
// import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'

// type Tab = 'history' | 'add' | 'send' | 'users' | 'invites' | 'audit' | 'export'

// interface FinancialRecord {
//   id: string
//   amount: number
//   type: 'INCOME' | 'EXPENSE'
//   category: string
//   date: string
//   notes?: string
//   deletedAt?: string | null
//   user?: { id: string; name: string; email: string }
//   userId?: string
// }
// interface Transfer {
//   id: string
//   amount: number
//   notes?: string
//   createdAt: string
//   from: { id: string; name: string; email: string }
//   to: { id: string; name: string; email: string }
// }
// interface AuditLog {
//   id: string
//   action: string
//   entity: string
//   entityId: string
//   createdAt: string
//   user: { name: string; email: string }
// }
// interface Invite {
//   id: string
//   email: string
//   role: string
//   expiresAt: string
//   usedAt?: string | null
//   createdAt: string
//   creator: { name: string; email: string }
//   token: string
// }
// interface User {
//   id: string
//   name: string
//   email: string
//   role: 'VIEWER' | 'ANALYST' | 'ADMIN'
//   isActive: boolean
//   balance: number
//   createdAt: string
// }
// interface HistoryRow {
//   id: string
//   kind: 'record' | 'transfer'
//   amount: number
//   type: 'INCOME' | 'EXPENSE'
//   category: string
//   date: string
//   notes?: string
//   deletedAt?: string | null
//   userName: string
//   userEmail: string
//   userId: string
// }

// type StyleMap = { [k: string]: React.CSSProperties }
// const S: StyleMap = {
//   page: {
//     minHeight: '100vh',
//     background: '#0a0f1e',
//     color: '#e2e8f0',
//     fontFamily: "'DM Sans',sans-serif",
//   },
//   sidebar: {
//     position: 'fixed',
//     left: 0,
//     top: 0,
//     bottom: 0,
//     width: '220px',
//     background: 'rgba(255,255,255,0.03)',
//     borderRight: '1px solid rgba(255,255,255,0.07)',
//     padding: '24px 0',
//     display: 'flex',
//     flexDirection: 'column',
//     zIndex: 10,
//   },
//   logo: {
//     padding: '0 20px 24px',
//     borderBottom: '1px solid rgba(255,255,255,0.07)',
//     marginBottom: '8px',
//   },
//   logoText: { fontSize: '16px', fontWeight: 700, color: '#f1f5f9' },
//   logoBadge: {
//     fontSize: '10px',
//     background: 'rgba(239,68,68,0.15)',
//     border: '1px solid rgba(239,68,68,0.3)',
//     color: '#f87171',
//     padding: '2px 8px',
//     borderRadius: '4px',
//     fontWeight: 600,
//     letterSpacing: '0.06em',
//   },
//   navBtn: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '10px',
//     padding: '10px 20px',
//     background: 'transparent',
//     border: 'none',
//     color: '#94a3b8',
//     fontSize: '14px',
//     fontWeight: 500,
//     cursor: 'pointer',
//     textAlign: 'left',
//     width: '100%',
//     transition: 'all 0.15s',
//   },
//   navBtnActive: {
//     color: '#f1f5f9',
//     background: 'rgba(99,102,241,0.12)',
//     borderLeft: '3px solid #6366f1',
//   },
//   main: { marginLeft: '220px', padding: '32px' },
//   card: {
//     background: 'rgba(255,255,255,0.04)',
//     border: '1px solid rgba(255,255,255,0.08)',
//     borderRadius: '16px',
//     padding: '24px',
//   },
//   h2: {
//     fontSize: '20px',
//     fontWeight: 700,
//     color: '#f1f5f9',
//     marginBottom: '20px',
//   },
//   label: {
//     display: 'block',
//     marginBottom: '6px',
//     fontSize: '13px',
//     fontWeight: 500,
//     color: '#94a3b8',
//   },
//   input: {
//     width: '100%',
//     padding: '10px 12px',
//     background: 'rgba(255,255,255,0.05)',
//     border: '1px solid rgba(255,255,255,0.1)',
//     borderRadius: '8px',
//     color: '#f1f5f9',
//     fontSize: '14px',
//     outline: 'none',
//     boxSizing: 'border-box',
//   },
//   btn: {
//     padding: '10px 20px',
//     background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '8px',
//     fontSize: '14px',
//     fontWeight: 600,
//     cursor: 'pointer',
//   },
//   btnGreen: {
//     padding: '10px 20px',
//     background: 'linear-gradient(135deg,#10b981,#059669)',
//     color: '#fff',
//     border: 'none',
//     borderRadius: '8px',
//     fontSize: '14px',
//     fontWeight: 600,
//     cursor: 'pointer',
//   },
//   btnRed: {
//     padding: '7px 14px',
//     background: 'rgba(239,68,68,0.15)',
//     color: '#f87171',
//     border: '1px solid rgba(239,68,68,0.3)',
//     borderRadius: '6px',
//     fontSize: '13px',
//     cursor: 'pointer',
//   },
//   btnOutline: {
//     padding: '7px 14px',
//     background: 'rgba(99,102,241,0.12)',
//     color: '#818cf8',
//     border: '1px solid rgba(99,102,241,0.3)',
//     borderRadius: '6px',
//     fontSize: '13px',
//     cursor: 'pointer',
//   },
//   table: { width: '100%', borderCollapse: 'collapse' },
//   th: {
//     padding: '10px 14px',
//     textAlign: 'left',
//     color: '#64748b',
//     fontSize: '12px',
//     fontWeight: 600,
//     borderBottom: '1px solid rgba(255,255,255,0.07)',
//     letterSpacing: '0.04em',
//   },
//   td: {
//     padding: '12px 14px',
//     borderBottom: '1px solid rgba(255,255,255,0.05)',
//     color: '#cbd5e1',
//     verticalAlign: 'middle',
//   },
//   success: {
//     background: 'rgba(16,185,129,0.1)',
//     border: '1px solid rgba(16,185,129,0.25)',
//     color: '#34d399',
//     padding: '12px 16px',
//     borderRadius: '10px',
//     fontSize: '14px',
//     marginBottom: '16px',
//   },
//   errorBox: {
//     background: 'rgba(239,68,68,0.1)',
//     border: '1px solid rgba(239,68,68,0.3)',
//     color: '#f87171',
//     padding: '12px 16px',
//     borderRadius: '10px',
//     fontSize: '14px',
//     marginBottom: '16px',
//   },
//   badge: {
//     display: 'inline-block',
//     padding: '2px 8px',
//     borderRadius: '4px',
//     fontSize: '11px',
//     fontWeight: 600,
//     letterSpacing: '0.04em',
//   },
//   filterRow: {
//     display: 'flex',
//     gap: '12px',
//     marginBottom: '20px',
//     flexWrap: 'wrap' as const,
//     alignItems: 'flex-end',
//   },
// }

// const NAV: { id: Tab; label: string; icon: string }[] = [
//   { id: 'history', label: 'History', icon: '📋' },
//   { id: 'add', label: 'Add Record', icon: '➕' },
//   { id: 'send', label: 'Send Money', icon: '💸' },
//   { id: 'users', label: 'Users', icon: '👥' },
//   { id: 'invites', label: 'Invites', icon: '✉️' },
//   { id: 'audit', label: 'Audit Logs', icon: '🔍' },
//   { id: 'export', label: 'Export', icon: '📤' },
// ]

// const CATS = [
//   'Food',
//   'Travel',
//   'Rent',
//   'Entertainment',
//   'Healthcare',
//   'Shopping',
//   'Utilities',
//   'Education',
//   'Salary',
//   'Freelance',
//   'Investment',
//   'Bonus',
// ]

// function bc(v: string): React.CSSProperties {
//   if (['INCOME', 'ADMIN', 'RESTORE'].includes(v))
//     return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
//   if (['EXPENSE', 'SOFT_DELETE', 'DELETE_USER'].includes(v))
//     return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
//   if (['ANALYST', 'UPDATE', 'UPDATE_USER', 'CREATE'].includes(v))
//     return { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
//   if (['Transfer Out', 'TRANSFER'].includes(v))
//     return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
//   return { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
// }
// function ac(name: string) {
//   const c = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
//   let h = 0
//   for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
//   return c[Math.abs(h) % c.length]
// }

// export default function AdminDashboard() {
//   const router = useRouter()
//   const [tab, setTab] = useState<Tab>('history')
//   const [name, setName] = useState('')
//   const [adminId, setAdminId] = useState('')
//   const [balance, setBalance] = useState(0)

//   // history
//   const [records, setRecords] = useState<FinancialRecord[]>([])
//   const [transfers, setTransfers] = useState<Transfer[]>([])
//   const [showDeleted, setShowDeleted] = useState(false)
//   const [filterType, setFilterType] = useState('')
//   const [filterCat, setFilterCat] = useState('')
//   const [filterStart, setFilterStart] = useState('')
//   const [filterEnd, setFilterEnd] = useState('')
//   const [filterUserId, setFilterUserId] = useState('')
//   const [showKind, setShowKind] = useState<'all' | 'records' | 'transfers'>(
//     'all',
//   )
//   const [histMsg, setHistMsg] = useState('')
//   const [histErr, setHistErr] = useState('')

//   // add record
//   const [recAmount, setRecAmount] = useState('')
//   const [recType, setRecType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
//   const [recCat, setRecCat] = useState(CATS[0])
//   const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0])
//   const [recNotes, setRecNotes] = useState('')
//   const [recMsg, setRecMsg] = useState('')
//   const [recErr, setRecErr] = useState('')
//   const [recLoading, setRecLoading] = useState(false)

//   // send money
//   const [toEmail, setToEmail] = useState('')
//   const [amount, setAmount] = useState('')
//   const [txNotes, setTxNotes] = useState('')
//   const [txMsg, setTxMsg] = useState('')
//   const [txErr, setTxErr] = useState('')
//   const [txLoading, setTxLoading] = useState(false)

//   // users
//   const [users, setUsers] = useState<User[]>([])
//   const [userMsg, setUserMsg] = useState('')
//   const [userErr, setUserErr] = useState('')

//   // invites
//   const [invites, setInvites] = useState<Invite[]>([])
//   const [invEmail, setInvEmail] = useState('')
//   const [invRole, setInvRole] = useState<'VIEWER' | 'ANALYST' | 'ADMIN'>(
//     'VIEWER',
//   )
//   const [invMsg, setInvMsg] = useState('')
//   const [invErr, setInvErr] = useState('')
//   const [invLoading, setInvLoading] = useState(false)
//   const [invUrl, setInvUrl] = useState('')
//   const [invToken, setInvToken] = useState('')
//   const [copied, setCopied] = useState(false)

//   // audit
//   const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
//   const [auditEntity, setAuditEntity] = useState('')

//   // export
//   const [expFormat, setExpFormat] = useState<'csv' | 'json'>('csv')
//   const [expType, setExpType] = useState('')
//   const [expStart, setExpStart] = useState('')
//   const [expEnd, setExpEnd] = useState('')
//   const [expMsg, setExpMsg] = useState('')

//   const token = () => localStorage.getItem('token') || ''
//   const hdrs = (): Record<string, string> => ({
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${token()}`,
//   })

//   const fetchBalance = useCallback(async () => {
//     const r = await fetch('/api/auth/me', { headers: hdrs() })
//     const j = await r.json()
//     if (j.success) setBalance(j.data.balance ?? 0)
//   }, [])

//   const fetchHistory = useCallback(async () => {
//     setHistErr('')
//     const p = new URLSearchParams()
//     if (filterType) p.set('type', filterType)
//     if (filterCat) p.set('category', filterCat)
//     if (filterStart) p.set('startDate', filterStart)
//     if (filterEnd) p.set('endDate', filterEnd)
//     if (showDeleted) p.set('includeDeleted', 'true')
//     if (filterUserId) p.set('filterUserId', filterUserId)
//     const [rr, tr] = await Promise.all([
//       fetch(`/api/records?${p}`, { headers: hdrs() }),
//       fetch('/api/transfers', { headers: hdrs() }),
//     ])
//     const rj = await rr.json()
//     const tj = await tr.json()
//     if (rj.success) setRecords(rj.data)
//     else setHistErr(rj.message || 'Failed to load')
//     if (tj.success) setTransfers(tj.data)
//   }, [filterType, filterCat, filterStart, filterEnd, showDeleted, filterUserId])

//   const fetchUsers = useCallback(async () => {
//     const r = await fetch('/api/users', { headers: hdrs() })
//     const j = await r.json()
//     if (j.success) setUsers(j.data)
//   }, [])

//   const fetchInvites = useCallback(async () => {
//     const r = await fetch('/api/invites', { headers: hdrs() })
//     const j = await r.json()
//     if (j.success) setInvites(j.data)
//   }, [])

//   const fetchAudit = useCallback(async () => {
//     const q = auditEntity ? `?entity=${auditEntity}` : ''
//     const r = await fetch(`/api/audit${q}`, { headers: hdrs() })
//     const j = await r.json()
//     if (j.success) setAuditLogs(j.data)
//   }, [auditEntity])

//   useEffect(() => {
//     setName(localStorage.getItem('name') || 'Admin')
//     setAdminId(localStorage.getItem('userId') || '')
//     fetchBalance()
//     fetchUsers()
//   }, [fetchBalance, fetchUsers])

//   useEffect(() => {
//     if (tab === 'history') fetchHistory()
//   }, [tab, fetchHistory])
//   useEffect(() => {
//     if (tab === 'send' || tab === 'add') fetchBalance()
//   }, [tab, fetchBalance])
//   useEffect(() => {
//     if (tab === 'users') fetchUsers()
//   }, [tab, fetchUsers])
//   useEffect(() => {
//     if (tab === 'invites') fetchInvites()
//   }, [tab, fetchInvites])
//   useEffect(() => {
//     if (tab === 'audit') fetchAudit()
//   }, [tab, fetchAudit])

//   // Build unified history rows
//   const historyRows: HistoryRow[] = (() => {
//     const rows: HistoryRow[] = []
//     if (showKind !== 'transfers') {
//       records.forEach((r) => {
//         const u = r.user || users.find((u) => u.id === r.userId)
//         rows.push({
//           id: r.id,
//           kind: 'record',
//           amount: r.amount,
//           type: r.type,
//           category: r.category,
//           date: r.date,
//           notes: r.notes,
//           deletedAt: r.deletedAt,
//           userName: u?.name ?? '—',
//           userEmail: u?.email ?? '—',
//           userId: r.userId ?? u?.id ?? '',
//         })
//       })
//     }
//     if (showKind !== 'records') {
//       transfers
//         .filter((t) => {
//           if (
//             filterUserId &&
//             t.from.id !== filterUserId &&
//             t.to.id !== filterUserId
//           )
//             return false
//           if (filterStart && new Date(t.createdAt) < new Date(filterStart))
//             return false
//           if (
//             filterEnd &&
//             new Date(t.createdAt) > new Date(filterEnd + 'T23:59:59')
//           )
//             return false
//           return true
//         })
//         .forEach((t) => {
//           if (!filterUserId || t.from.id === filterUserId)
//             rows.push({
//               id: `tx_out_${t.id}`,
//               kind: 'transfer',
//               amount: t.amount,
//               type: 'EXPENSE',
//               category: 'Transfer Out',
//               date: t.createdAt,
//               notes: `→ ${t.to.name}${t.notes ? ` — ${t.notes}` : ''}`,
//               deletedAt: null,
//               userName: t.from.name,
//               userEmail: t.from.email,
//               userId: t.from.id,
//             })
//           if (!filterUserId || t.to.id === filterUserId)
//             rows.push({
//               id: `tx_in_${t.id}`,
//               kind: 'transfer',
//               amount: t.amount,
//               type: 'INCOME',
//               category: 'Transfer In',
//               date: t.createdAt,
//               notes: `← ${t.from.name}${t.notes ? ` — ${t.notes}` : ''}`,
//               deletedAt: null,
//               userName: t.to.name,
//               userEmail: t.to.email,
//               userId: t.to.id,
//             })
//         })
//     }
//     const typed = filterType ? rows.filter((r) => r.type === filterType) : rows
//     return typed.sort(
//       (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
//     )
//   })()

//   async function softDelete(id: string) {
//     const r = await fetch(`/api/records/${id}`, {
//       method: 'DELETE',
//       headers: hdrs(),
//     })
//     const j = await r.json()
//     if (j.success) {
//       setHistMsg('Deleted.')
//       fetchHistory()
//     } else setHistErr(j.message)
//   }
//   async function restore(id: string) {
//     const r = await fetch(`/api/records/${id}`, {
//       method: 'PATCH',
//       headers: hdrs(),
//       body: JSON.stringify({ _action: 'restore' }),
//     })
//     const j = await r.json()
//     if (j.success) {
//       setHistMsg('Restored.')
//       fetchHistory()
//     } else setHistErr(j.message)
//   }
//   async function addRecord() {
//     setRecMsg('')
//     setRecErr('')
//     if (!recAmount || !recDate) {
//       setRecErr('Amount and date required.')
//       return
//     }
//     setRecLoading(true)
//     try {
//       const r = await fetch('/api/records', {
//         method: 'POST',
//         headers: hdrs(),
//         body: JSON.stringify({
//           amount: parseFloat(recAmount),
//           type: recType,
//           category: recCat,
//           date: recDate,
//           notes: recNotes,
//         }),
//       })
//       const j = await r.json()
//       if (j.success) {
//         setRecMsg('Record added!')
//         setRecAmount('')
//         setRecNotes('')
//         fetchBalance()
//       } else setRecErr(j.message)
//     } finally {
//       setRecLoading(false)
//     }
//   }
//   async function sendMoney() {
//     setTxMsg('')
//     setTxErr('')
//     if (!toEmail || !amount) {
//       setTxErr('Email and amount required.')
//       return
//     }
//     setTxLoading(true)
//     try {
//       const r = await fetch('/api/transfers', {
//         method: 'POST',
//         headers: hdrs(),
//         body: JSON.stringify({
//           toEmail,
//           amount: parseFloat(amount),
//           notes: txNotes,
//         }),
//       })
//       const j = await r.json()
//       if (j.success) {
//         setTxMsg(j.data.message)
//         setToEmail('')
//         setAmount('')
//         setTxNotes('')
//         fetchBalance()
//       } else setTxErr(j.message)
//     } finally {
//       setTxLoading(false)
//     }
//   }
//   async function createInvite() {
//     setInvMsg('')
//     setInvErr('')
//     setInvUrl('')
//     setInvToken('')
//     if (!invEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invEmail)) {
//       setInvErr('Valid email required.')
//       return
//     }
//     setInvLoading(true)
//     try {
//       const r = await fetch('/api/invites', {
//         method: 'POST',
//         headers: hdrs(),
//         body: JSON.stringify({ email: invEmail, role: invRole }),
//       })
//       const j = await r.json()
//       if (j.success) {
//         setInvMsg(`Invite sent to ${j.data.email}`)
//         setInvUrl(j.data.inviteUrl || '')
//         setInvToken(j.data.token || '')
//         setInvEmail('')
//         fetchInvites()
//       } else setInvErr(j.message)
//     } finally {
//       setInvLoading(false)
//     }
//   }
//   async function updateUserRole(id: string, role: string) {
//     const r = await fetch(`/api/users/${id}`, {
//       method: 'PATCH',
//       headers: hdrs(),
//       body: JSON.stringify({ role }),
//     })
//     const j = await r.json()
//     if (j.success) {
//       setUserMsg('Role updated.')
//       fetchUsers()
//     } else setUserErr(j.message)
//   }
//   async function toggleActive(id: string, cur: boolean) {
//     const r = await fetch(`/api/users/${id}`, {
//       method: 'PATCH',
//       headers: hdrs(),
//       body: JSON.stringify({ isActive: !cur }),
//     })
//     const j = await r.json()
//     if (j.success) {
//       setUserMsg(`User ${!cur ? 'activated' : 'deactivated'}.`)
//       fetchUsers()
//     } else setUserErr(j.message)
//   }
//   async function deleteUser(id: string) {
//     if (!confirm('Delete this user permanently?')) return
//     const r = await fetch(`/api/users/${id}`, {
//       method: 'DELETE',
//       headers: hdrs(),
//     })
//     const j = await r.json()
//     if (j.success) {
//       setUserMsg('User deleted.')
//       fetchUsers()
//     } else setUserErr(j.message)
//   }
//   async function handleExport() {
//     setExpMsg('')
//     const p = new URLSearchParams({ export: expFormat })
//     if (expType) p.append('type', expType)
//     if (expStart) p.append('startDate', expStart)
//     if (expEnd) p.append('endDate', expEnd)
//     const r = await fetch(`/api/records?${p}`, { headers: hdrs() })
//     if (!r.ok) {
//       setExpMsg('Export failed.')
//       return
//     }
//     const blob = await r.blob()
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = `records.${expFormat}`
//     a.click()
//     URL.revokeObjectURL(url)
//     setExpMsg(`Exported as ${expFormat.toUpperCase()}.`)
//   }
//   function logout() {
//     localStorage.clear()
//     router.push('/login')
//   }

//   return (
//     <div style={S.page}>
//       <div style={S.sidebar}>
//         <div style={S.logo}>
//           <div
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'space-between',
//             }}
//           >
//             <span style={S.logoText}>FinanceApp</span>
//             <span style={S.logoBadge}>ADMIN</span>
//           </div>
//           <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
//             {name}
//           </div>
//           <div
//             style={{
//               marginTop: '4px',
//               fontSize: '13px',
//               color: '#34d399',
//               fontWeight: 600,
//             }}
//           >
//             ₹{balance.toLocaleString('en-IN')}
//           </div>
//         </div>
//         {NAV.map((n) => (
//           <button
//             key={n.id}
//             style={{ ...S.navBtn, ...(tab === n.id ? S.navBtnActive : {}) }}
//             onClick={() => setTab(n.id)}
//           >
//             <span>{n.icon}</span>
//             {n.label}
//           </button>
//         ))}
//         <div style={{ flex: 1 }} />
//         <button style={{ ...S.navBtn, color: '#f87171' }} onClick={logout}>
//           🚪 Logout
//         </button>
//       </div>

//       <div style={S.main}>
//         {/* HISTORY */}
//         {tab === 'history' && (
//           <div style={S.card}>
//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between',
//                 marginBottom: '16px',
//               }}
//             >
//               <h2 style={{ ...S.h2, marginBottom: 0 }}>Transaction History</h2>
//               <label
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px',
//                   fontSize: '13px',
//                   color: '#94a3b8',
//                   cursor: 'pointer',
//                 }}
//               >
//                 <input
//                   type="checkbox"
//                   checked={showDeleted}
//                   onChange={(e) => setShowDeleted(e.target.checked)}
//                 />{' '}
//                 Show deleted
//               </label>
//             </div>
//             <div style={S.filterRow}>
//               <div style={{ flex: 2, minWidth: '180px' }}>
//                 <label style={S.label}>View as User</label>
//                 <select
//                   style={S.input}
//                   value={filterUserId}
//                   onChange={(e) => setFilterUserId(e.target.value)}
//                 >
//                   <option value="">All Users</option>
//                   {users.map((u) => (
//                     <option key={u.id} value={u.id}>
//                       {u.name} ({u.role})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div style={{ flex: 1, minWidth: '140px' }}>
//                 <label style={S.label}>Show</label>
//                 <select
//                   style={S.input}
//                   value={showKind}
//                   onChange={(e) =>
//                     setShowKind(
//                       e.target.value as 'all' | 'records' | 'transfers',
//                     )
//                   }
//                 >
//                   <option value="all">Records + Transfers</option>
//                   <option value="records">Records only</option>
//                   <option value="transfers">Transfers only</option>
//                 </select>
//               </div>
//               <div style={{ flex: 1, minWidth: '110px' }}>
//                 <label style={S.label}>Type</label>
//                 <select
//                   style={S.input}
//                   value={filterType}
//                   onChange={(e) => setFilterType(e.target.value)}
//                 >
//                   <option value="">All</option>
//                   <option value="INCOME">Income</option>
//                   <option value="EXPENSE">Expense</option>
//                 </select>
//               </div>
//               {showKind !== 'transfers' && (
//                 <div style={{ flex: 1, minWidth: '130px' }}>
//                   <label style={S.label}>Category</label>
//                   <select
//                     style={S.input}
//                     value={filterCat}
//                     onChange={(e) => setFilterCat(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     {CATS.map((c) => (
//                       <option key={c} value={c}>
//                         {c}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//               <div style={{ flex: 1, minWidth: '120px' }}>
//                 <label style={S.label}>From</label>
//                 <input
//                   style={S.input}
//                   type="date"
//                   value={filterStart}
//                   onChange={(e) => setFilterStart(e.target.value)}
//                 />
//               </div>
//               <div style={{ flex: 1, minWidth: '120px' }}>
//                 <label style={S.label}>To</label>
//                 <input
//                   style={S.input}
//                   type="date"
//                   value={filterEnd}
//                   onChange={(e) => setFilterEnd(e.target.value)}
//                 />
//               </div>
//               <div
//                 style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}
//               >
//                 <button style={S.btn} onClick={fetchHistory}>
//                   Apply
//                 </button>
//                 <button
//                   style={S.btnOutline}
//                   onClick={() => {
//                     setFilterType('')
//                     setFilterCat('')
//                     setFilterStart('')
//                     setFilterEnd('')
//                     setFilterUserId('')
//                     setShowKind('all')
//                   }}
//                 >
//                   Clear
//                 </button>
//               </div>
//             </div>
//             {histMsg && <div style={S.success}>{histMsg}</div>}
//             {histErr && <div style={S.errorBox}>{histErr}</div>}
//             <div style={{ overflowX: 'auto' }}>
//               <table style={S.table}>
//                 <thead>
//                   <tr>
//                     {[
//                       'User',
//                       'Type',
//                       'Category',
//                       'Amount',
//                       'Date',
//                       'Notes',
//                       'Source',
//                       'Status',
//                       'Actions',
//                     ].map((h) => (
//                       <th key={h} style={S.th}>
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {historyRows.map((row) => (
//                     <tr
//                       key={row.id}
//                       style={{ opacity: row.deletedAt ? 0.5 : 1 }}
//                     >
//                       <td style={S.td}>
//                         <div
//                           style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '8px',
//                           }}
//                         >
//                           <div
//                             style={{
//                               width: '28px',
//                               height: '28px',
//                               borderRadius: '50%',
//                               background: ac(row.userName),
//                               display: 'flex',
//                               alignItems: 'center',
//                               justifyContent: 'center',
//                               fontSize: '11px',
//                               fontWeight: 700,
//                               color: '#fff',
//                               flexShrink: 0,
//                             }}
//                           >
//                             {row.userName.charAt(0).toUpperCase()}
//                           </div>
//                           <div>
//                             <div
//                               style={{
//                                 fontSize: '13px',
//                                 fontWeight: 600,
//                                 color: '#f1f5f9',
//                               }}
//                             >
//                               {row.userName}
//                             </div>
//                             <div style={{ fontSize: '11px', color: '#64748b' }}>
//                               {row.userEmail}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td style={S.td}>
//                         <span style={{ ...S.badge, ...bc(row.type) }}>
//                           {row.type}
//                         </span>
//                       </td>
//                       <td style={S.td}>
//                         <span style={{ ...S.badge, ...bc(row.category) }}>
//                           {row.category}
//                         </span>
//                       </td>
//                       <td
//                         style={{
//                           ...S.td,
//                           fontWeight: 700,
//                           color: row.type === 'INCOME' ? '#34d399' : '#f87171',
//                         }}
//                       >
//                         {row.type === 'INCOME' ? '+' : '−'}₹
//                         {row.amount.toLocaleString('en-IN')}
//                       </td>
//                       <td style={{ ...S.td, fontSize: '13px' }}>
//                         {new Date(row.date).toLocaleDateString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric',
//                         })}
//                       </td>
//                       <td
//                         style={{
//                           ...S.td,
//                           color: '#94a3b8',
//                           fontSize: '13px',
//                           maxWidth: '180px',
//                         }}
//                       >
//                         <div
//                           style={{
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             whiteSpace: 'nowrap',
//                           }}
//                         >
//                           {row.notes || '—'}
//                         </div>
//                       </td>
//                       <td style={S.td}>
//                         <span
//                           style={{
//                             ...S.badge,
//                             ...(row.kind === 'transfer'
//                               ? {
//                                   background: 'rgba(245,158,11,0.15)',
//                                   color: '#fbbf24',
//                                 }
//                               : {
//                                   background: 'rgba(99,102,241,0.15)',
//                                   color: '#818cf8',
//                                 }),
//                           }}
//                         >
//                           {row.kind === 'transfer'
//                             ? '💸 Transfer'
//                             : '📋 Record'}
//                         </span>
//                       </td>
//                       <td style={S.td}>
//                         <span
//                           style={{
//                             ...S.badge,
//                             ...(row.deletedAt
//                               ? {
//                                   background: 'rgba(239,68,68,0.15)',
//                                   color: '#f87171',
//                                 }
//                               : {
//                                   background: 'rgba(16,185,129,0.15)',
//                                   color: '#34d399',
//                                 }),
//                           }}
//                         >
//                           {row.deletedAt ? 'Deleted' : 'Active'}
//                         </span>
//                       </td>
//                       <td style={S.td}>
//                         {row.kind === 'transfer' ? (
//                           <span style={{ color: '#475569', fontSize: '12px' }}>
//                             —
//                           </span>
//                         ) : !row.deletedAt ? (
//                           <button
//                             style={S.btnRed}
//                             onClick={() => softDelete(row.id)}
//                           >
//                             Delete
//                           </button>
//                         ) : (
//                           <button
//                             style={S.btnOutline}
//                             onClick={() => restore(row.id)}
//                           >
//                             Restore
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                   {historyRows.length === 0 && (
//                     <tr>
//                       <td
//                         style={{
//                           ...S.td,
//                           textAlign: 'center',
//                           color: '#64748b',
//                           padding: '48px',
//                         }}
//                         colSpan={9}
//                       >
//                         No transactions found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* ADD RECORD */}
//         {tab === 'add' && (
//           <div style={S.card}>
//             <h2 style={S.h2}>Add Record</h2>
//             <div
//               style={{
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 1fr',
//                 gap: '16px',
//                 maxWidth: '600px',
//               }}
//             >
//               <div>
//                 <label style={S.label}>Type</label>
//                 <select
//                   style={S.input}
//                   value={recType}
//                   onChange={(e) =>
//                     setRecType(e.target.value as 'INCOME' | 'EXPENSE')
//                   }
//                 >
//                   <option value="EXPENSE">Expense</option>
//                   <option value="INCOME">Income</option>
//                 </select>
//               </div>
//               <div>
//                 <label style={S.label}>Category</label>
//                 <select
//                   style={S.input}
//                   value={recCat}
//                   onChange={(e) => setRecCat(e.target.value)}
//                 >
//                   {CATS.map((c) => (
//                     <option key={c} value={c}>
//                       {c}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label style={S.label}>Amount (₹)</label>
//                 <input
//                   style={S.input}
//                   type="number"
//                   value={recAmount}
//                   onChange={(e) => setRecAmount(e.target.value)}
//                   placeholder="0"
//                   min="1"
//                 />
//               </div>
//               <div>
//                 <label style={S.label}>Date</label>
//                 <input
//                   style={S.input}
//                   type="date"
//                   value={recDate}
//                   onChange={(e) => setRecDate(e.target.value)}
//                 />
//               </div>
//               <div style={{ gridColumn: '1/-1' }}>
//                 <label style={S.label}>Notes (optional)</label>
//                 <input
//                   style={S.input}
//                   value={recNotes}
//                   onChange={(e) => setRecNotes(e.target.value)}
//                   placeholder="What was this for?"
//                 />
//               </div>
//             </div>
//             {recMsg && (
//               <div style={{ ...S.success, marginTop: '16px' }}>{recMsg}</div>
//             )}
//             {recErr && (
//               <div style={{ ...S.errorBox, marginTop: '16px' }}>{recErr}</div>
//             )}
//             <button
//               style={{ ...S.btn, marginTop: '20px' }}
//               onClick={addRecord}
//               disabled={recLoading}
//             >
//               {recLoading ? 'Saving...' : '➕ Add Record'}
//             </button>
//           </div>
//         )}

//         {/* SEND MONEY */}
//         {tab === 'send' && (
//           <div style={S.card}>
//             <h2 style={S.h2}>Send Money</h2>
//             <div
//               style={{
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 1fr',
//                 gap: '16px',
//                 maxWidth: '600px',
//                 marginBottom: '16px',
//               }}
//             >
//               <div>
//                 <label style={S.label}>Receiver Email</label>
//                 <input
//                   style={S.input}
//                   type="email"
//                   value={toEmail}
//                   onChange={(e) => setToEmail(e.target.value)}
//                   placeholder="receiver@example.com"
//                 />
//               </div>
//               <div>
//                 <label style={S.label}>Amount (₹)</label>
//                 <input
//                   style={S.input}
//                   type="number"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   placeholder="0"
//                   min="1"
//                 />
//               </div>
//               <div style={{ gridColumn: '1/-1' }}>
//                 <label style={S.label}>Notes (optional)</label>
//                 <input
//                   style={S.input}
//                   value={txNotes}
//                   onChange={(e) => setTxNotes(e.target.value)}
//                   placeholder="Payment for..."
//                 />
//               </div>
//             </div>
//             {txMsg && <div style={S.success}>{txMsg}</div>}
//             {txErr && <div style={S.errorBox}>{txErr}</div>}
//             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//               <button
//                 style={S.btnGreen}
//                 onClick={sendMoney}
//                 disabled={txLoading}
//               >
//                 {txLoading ? 'Sending...' : '💸 Send Money'}
//               </button>
//               <span style={{ fontSize: '13px', color: '#64748b' }}>
//                 Balance:{' '}
//                 <strong style={{ color: '#34d399' }}>
//                   ₹{balance.toLocaleString('en-IN')}
//                 </strong>
//               </span>
//             </div>
//           </div>
//         )}

//         {/* USERS */}
//         {tab === 'users' && (
//           <div style={S.card}>
//             <h2 style={S.h2}>Manage Users</h2>
//             {userMsg && <div style={S.success}>{userMsg}</div>}
//             {userErr && <div style={S.errorBox}>{userErr}</div>}
//             <div style={{ overflowX: 'auto' }}>
//               <table style={S.table}>
//                 <thead>
//                   <tr>
//                     {[
//                       'Name',
//                       'Email',
//                       'Role',
//                       'Balance',
//                       'Status',
//                       'Actions',
//                     ].map((h) => (
//                       <th key={h} style={S.th}>
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.map((u) => (
//                     <tr key={u.id}>
//                       <td style={S.td}>
//                         <div
//                           style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '8px',
//                           }}
//                         >
//                           <div
//                             style={{
//                               width: '32px',
//                               height: '32px',
//                               borderRadius: '50%',
//                               background: ac(u.name),
//                               display: 'flex',
//                               alignItems: 'center',
//                               justifyContent: 'center',
//                               fontSize: '12px',
//                               fontWeight: 700,
//                               color: '#fff',
//                             }}
//                           >
//                             {u.name.charAt(0).toUpperCase()}
//                           </div>
//                           <div>
//                             <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
//                               {u.name}
//                             </div>
//                             <div style={{ fontSize: '11px', color: '#64748b' }}>
//                               {u.id.slice(0, 8)}...
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       <td style={S.td}>{u.email}</td>
//                       <td style={S.td}>
//                         <select
//                           style={{
//                             ...S.input,
//                             width: 'auto',
//                             padding: '4px 8px',
//                             fontSize: '12px',
//                           }}
//                           value={u.role}
//                           onChange={(e) => updateUserRole(u.id, e.target.value)}
//                         >
//                           <option value="VIEWER">VIEWER</option>
//                           <option value="ANALYST">ANALYST</option>
//                           <option value="ADMIN">ADMIN</option>
//                         </select>
//                       </td>
//                       <td
//                         style={{ ...S.td, color: '#34d399', fontWeight: 600 }}
//                       >
//                         ₹{u.balance.toLocaleString('en-IN')}
//                       </td>
//                       <td style={S.td}>
//                         <span
//                           style={{
//                             ...S.badge,
//                             ...(u.isActive
//                               ? {
//                                   background: 'rgba(16,185,129,0.15)',
//                                   color: '#34d399',
//                                 }
//                               : {
//                                   background: 'rgba(239,68,68,0.15)',
//                                   color: '#f87171',
//                                 }),
//                           }}
//                         >
//                           {u.isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </td>
//                       <td
//                         style={{
//                           ...S.td,
//                           display: 'flex',
//                           gap: '6px',
//                           flexWrap: 'wrap',
//                         }}
//                       >
//                         <button
//                           style={S.btnOutline}
//                           onClick={() => toggleActive(u.id, u.isActive)}
//                         >
//                           {u.isActive ? 'Deactivate' : 'Activate'}
//                         </button>
//                         <button
//                           style={S.btnRed}
//                           onClick={() => deleteUser(u.id)}
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                   {users.length === 0 && (
//                     <tr>
//                       <td
//                         style={{
//                           ...S.td,
//                           textAlign: 'center',
//                           color: '#64748b',
//                         }}
//                         colSpan={6}
//                       >
//                         No users found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* INVITES */}
//         {tab === 'invites' && (
//           <div
//             style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
//           >
//             <div style={S.card}>
//               <h2 style={S.h2}>Create Invite</h2>
//               <div
//                 style={{
//                   display: 'grid',
//                   gridTemplateColumns: '1fr 1fr',
//                   gap: '16px',
//                   marginBottom: '16px',
//                 }}
//               >
//                 <div>
//                   <label style={S.label}>Email</label>
//                   <input
//                     style={S.input}
//                     type="email"
//                     value={invEmail}
//                     onChange={(e) => setInvEmail(e.target.value)}
//                     placeholder="newuser@example.com"
//                   />
//                 </div>
//                 <div>
//                   <label style={S.label}>Role</label>
//                   <select
//                     style={S.input}
//                     value={invRole}
//                     onChange={(e) =>
//                       setInvRole(
//                         e.target.value as 'VIEWER' | 'ANALYST' | 'ADMIN',
//                       )
//                     }
//                   >
//                     <option value="VIEWER">VIEWER</option>
//                     <option value="ANALYST">ANALYST</option>
//                     <option value="ADMIN">ADMIN</option>
//                   </select>
//                 </div>
//               </div>
//               {invMsg && <div style={S.success}>{invMsg}</div>}
//               {invErr && <div style={S.errorBox}>{invErr}</div>}
//               {invUrl && (
//                 <div
//                   style={{
//                     background: 'rgba(99,102,241,0.1)',
//                     border: '1px solid rgba(99,102,241,0.25)',
//                     borderRadius: '8px',
//                     padding: '14px',
//                     marginBottom: '16px',
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontSize: '12px',
//                       color: '#64748b',
//                       marginBottom: '6px',
//                     }}
//                   >
//                     Invite link:
//                   </div>
//                   <div
//                     style={{
//                       fontFamily: 'monospace',
//                       fontSize: '12px',
//                       color: '#818cf8',
//                       wordBreak: 'break-all',
//                       marginBottom: '10px',
//                     }}
//                   >
//                     {invUrl}
//                   </div>
//                   <div style={{ display: 'flex', gap: '8px' }}>
//                     <button
//                       style={S.btnOutline}
//                       onClick={async () => {
//                         await navigator.clipboard.writeText(invUrl)
//                         setCopied(true)
//                         setTimeout(() => setCopied(false), 2000)
//                       }}
//                     >
//                       {copied ? '✅ Copied!' : '📋 Copy'}
//                     </button>
//                     <button
//                       style={S.btnOutline}
//                       onClick={() => window.open(invUrl, '_blank')}
//                     >
//                       🔗 Open
//                     </button>
//                   </div>
//                   <div
//                     style={{
//                       marginTop: '8px',
//                       fontSize: '11px',
//                       color: '#475569',
//                       fontFamily: 'monospace',
//                     }}
//                   >
//                     Token: {invToken.slice(0, 20)}...
//                   </div>
//                 </div>
//               )}
//               <button
//                 style={S.btn}
//                 onClick={createInvite}
//                 disabled={invLoading}
//               >
//                 {invLoading ? 'Creating...' : '✉️ Send Invite'}
//               </button>
//             </div>
//             <div style={S.card}>
//               <h2 style={S.h2}>All Invites</h2>
//               <div style={{ overflowX: 'auto' }}>
//                 <table style={S.table}>
//                   <thead>
//                     <tr>
//                       {['Email', 'Role', 'Created By', 'Expires', 'Status'].map(
//                         (h) => (
//                           <th key={h} style={S.th}>
//                             {h}
//                           </th>
//                         ),
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {invites.map((inv) => {
//                       const expired = new Date(inv.expiresAt) < new Date()
//                       const status = inv.usedAt
//                         ? 'Used'
//                         : expired
//                           ? 'Expired'
//                           : 'Active'
//                       const sc: React.CSSProperties = inv.usedAt
//                         ? {
//                             background: 'rgba(148,163,184,0.15)',
//                             color: '#94a3b8',
//                           }
//                         : expired
//                           ? {
//                               background: 'rgba(239,68,68,0.15)',
//                               color: '#f87171',
//                             }
//                           : {
//                               background: 'rgba(16,185,129,0.15)',
//                               color: '#34d399',
//                             }
//                       return (
//                         <tr key={inv.id}>
//                           <td style={S.td}>{inv.email}</td>
//                           <td style={S.td}>
//                             <span style={{ ...S.badge, ...bc(inv.role) }}>
//                               {inv.role}
//                             </span>
//                           </td>
//                           <td style={S.td}>{inv.creator.name}</td>
//                           <td style={S.td}>
//                             {new Date(inv.expiresAt).toLocaleDateString()}
//                           </td>
//                           <td style={S.td}>
//                             <span style={{ ...S.badge, ...sc }}>{status}</span>
//                           </td>
//                         </tr>
//                       )
//                     })}
//                     {invites.length === 0 && (
//                       <tr>
//                         <td
//                           style={{
//                             ...S.td,
//                             textAlign: 'center',
//                             color: '#64748b',
//                           }}
//                           colSpan={5}
//                         >
//                           No invites yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* AUDIT */}
//         {tab === 'audit' && (
//           <div style={S.card}>
//             <div
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '16px',
//                 marginBottom: '20px',
//               }}
//             >
//               <h2 style={{ ...S.h2, marginBottom: 0, flex: 1 }}>Audit Logs</h2>
//               <select
//                 style={{ ...S.input, width: '180px' }}
//                 value={auditEntity}
//                 onChange={(e) => setAuditEntity(e.target.value)}
//               >
//                 <option value="">All Entities</option>
//                 <option value="FinancialRecord">FinancialRecord</option>
//                 <option value="Transfer">Transfer</option>
//                 <option value="InviteToken">InviteToken</option>
//                 <option value="User">User</option>
//               </select>
//               <button style={S.btn} onClick={fetchAudit}>
//                 Refresh
//               </button>
//             </div>
//             <div style={{ overflowX: 'auto' }}>
//               <table style={S.table}>
//                 <thead>
//                   <tr>
//                     {['User', 'Action', 'Entity', 'Entity ID', 'Time'].map(
//                       (h) => (
//                         <th key={h} style={S.th}>
//                           {h}
//                         </th>
//                       ),
//                     )}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {auditLogs.map((log) => (
//                     <tr key={log.id}>
//                       <td style={S.td}>
//                         {log.user.name}
//                         <br />
//                         <span style={{ color: '#64748b', fontSize: '12px' }}>
//                           {log.user.email}
//                         </span>
//                       </td>
//                       <td style={S.td}>
//                         <span style={{ ...S.badge, ...bc(log.action) }}>
//                           {log.action}
//                         </span>
//                       </td>
//                       <td style={S.td}>{log.entity}</td>
//                       <td
//                         style={{
//                           ...S.td,
//                           fontFamily: 'monospace',
//                           fontSize: '12px',
//                         }}
//                       >
//                         {log.entityId.slice(0, 12)}...
//                       </td>
//                       <td style={S.td}>
//                         {new Date(log.createdAt).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                   {auditLogs.length === 0 && (
//                     <tr>
//                       <td
//                         style={{
//                           ...S.td,
//                           textAlign: 'center',
//                           color: '#64748b',
//                         }}
//                         colSpan={5}
//                       >
//                         No logs found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* EXPORT */}
//         {tab === 'export' && (
//           <div style={S.card}>
//             <h2 style={S.h2}>Export Records</h2>
//             <div
//               style={{
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 1fr',
//                 gap: '16px',
//                 maxWidth: '520px',
//               }}
//             >
//               <div>
//                 <label style={S.label}>Format</label>
//                 <select
//                   style={S.input}
//                   value={expFormat}
//                   onChange={(e) =>
//                     setExpFormat(e.target.value as 'csv' | 'json')
//                   }
//                 >
//                   <option value="csv">CSV</option>
//                   <option value="json">JSON</option>
//                 </select>
//               </div>
//               <div>
//                 <label style={S.label}>Type</label>
//                 <select
//                   style={S.input}
//                   value={expType}
//                   onChange={(e) => setExpType(e.target.value)}
//                 >
//                   <option value="">All</option>
//                   <option value="INCOME">Income</option>
//                   <option value="EXPENSE">Expense</option>
//                 </select>
//               </div>
//               <div>
//                 <label style={S.label}>Start Date</label>
//                 <input
//                   style={S.input}
//                   type="date"
//                   value={expStart}
//                   onChange={(e) => setExpStart(e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label style={S.label}>End Date</label>
//                 <input
//                   style={S.input}
//                   type="date"
//                   value={expEnd}
//                   onChange={(e) => setExpEnd(e.target.value)}
//                 />
//               </div>
//             </div>
//             {expMsg && (
//               <div style={{ ...S.success, marginTop: '16px' }}>{expMsg}</div>
//             )}
//             <button
//               style={{ ...S.btnGreen, marginTop: '20px' }}
//               onClick={handleExport}
//             >
//               📥 Export {expFormat.toUpperCase()}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'

type Tab =
  | 'dashboard'
  | 'history'
  | 'add'
  | 'send'
  | 'users'
  | 'invites'
  | 'audit'
  | 'export'

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
interface HistoryRow {
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

type StyleMap = { [k: string]: React.CSSProperties }
const S: StyleMap = {
  page: {
    minHeight: '100vh',
    background: '#0a0f1e',
    color: '#e2e8f0',
    fontFamily: "'DM Sans',sans-serif",
  },
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: '220px',
    background: 'rgba(255,255,255,0.03)',
    borderRight: '1px solid rgba(255,255,255,0.07)',
    padding: '24px 0',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
  },
  logo: {
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    marginBottom: '8px',
  },
  logoText: { fontSize: '16px', fontWeight: 700, color: '#f1f5f9' },
  logoBadge: {
    fontSize: '10px',
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
    padding: '2px 8px',
    borderRadius: '4px',
    fontWeight: 600,
    letterSpacing: '0.06em',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.15s',
  },
  navBtnActive: {
    color: '#f1f5f9',
    background: 'rgba(99,102,241,0.12)',
    borderLeft: '3px solid #6366f1',
  },
  main: { marginLeft: '220px', padding: '32px' },
  card: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '24px',
  },
  h2: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#f1f5f9',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#94a3b8',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnGreen: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg,#10b981,#059669)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnRed: {
    padding: '7px 14px',
    background: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnOutline: {
    padding: '7px 14px',
    background: 'rgba(99,102,241,0.12)',
    color: '#818cf8',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 600,
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    letterSpacing: '0.04em',
  },
  td: {
    padding: '12px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#cbd5e1',
    verticalAlign: 'middle',
  },
  success: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
    color: '#34d399',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
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

// Budget limits per category (₹/month) — admin can edit inline
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

function bc(v: string): React.CSSProperties {
  if (['INCOME', 'ADMIN', 'RESTORE'].includes(v))
    return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
  if (['EXPENSE', 'SOFT_DELETE', 'DELETE_USER'].includes(v))
    return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
  if (['ANALYST', 'UPDATE', 'UPDATE_USER', 'CREATE'].includes(v))
    return { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
  if (['Transfer Out', 'TRANSFER'].includes(v))
    return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
  return { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
}
function ac(name: string) {
  const c = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return c[Math.abs(h) % c.length]
}
function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}
function pct(a: number, b: number) {
  return b === 0 ? 0 : Math.round((a / b) * 100)
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [name, setName] = useState('')
  const [adminId, setAdminId] = useState('')
  const [balance, setBalance] = useState(0)

  // dashboard
  const [summary, setSummary] = useState<Summary | null>(null)
  const [trends, setTrends] = useState<TrendPoint[]>([])
  const [trendPeriod, setTrendPeriod] = useState<'monthly' | 'weekly'>(
    'monthly',
  )
  const [budgets, setBudgets] =
    useState<Record<string, number>>(DEFAULT_BUDGETS)
  const [editBudgetCat, setEditBudgetCat] = useState<string | null>(null)
  const [editBudgetVal, setEditBudgetVal] = useState('')

  // history
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [showDeleted, setShowDeleted] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [filterUserId, setFilterUserId] = useState('')
  const [showKind, setShowKind] = useState<'all' | 'records' | 'transfers'>(
    'all',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [histMsg, setHistMsg] = useState('')
  const [histErr, setHistErr] = useState('')

  // add record
  const [recAmount, setRecAmount] = useState('')
  const [recType, setRecType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [recCat, setRecCat] = useState(CATS[0])
  const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0])
  const [recNotes, setRecNotes] = useState('')
  const [recMsg, setRecMsg] = useState('')
  const [recErr, setRecErr] = useState('')
  const [recLoading, setRecLoading] = useState(false)

  // send money
  const [toEmail, setToEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [txNotes, setTxNotes] = useState('')
  const [txMsg, setTxMsg] = useState('')
  const [txErr, setTxErr] = useState('')
  const [txLoading, setTxLoading] = useState(false)

  // users
  const [users, setUsers] = useState<User[]>([])
  const [userMsg, setUserMsg] = useState('')
  const [userErr, setUserErr] = useState('')
  const [userSearch, setUserSearch] = useState('')

  // invites
  const [invites, setInvites] = useState<Invite[]>([])
  const [invEmail, setInvEmail] = useState('')
  const [invRole, setInvRole] = useState<'VIEWER' | 'ANALYST' | 'ADMIN'>(
    'VIEWER',
  )
  const [invMsg, setInvMsg] = useState('')
  const [invErr, setInvErr] = useState('')
  const [invLoading, setInvLoading] = useState(false)
  const [invUrl, setInvUrl] = useState('')
  const [invToken, setInvToken] = useState('')
  const [copied, setCopied] = useState(false)

  // audit
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditEntity, setAuditEntity] = useState('')

  // export
  const [expFormat, setExpFormat] = useState<'csv' | 'json'>('csv')
  const [expType, setExpType] = useState('')
  const [expStart, setExpStart] = useState('')
  const [expEnd, setExpEnd] = useState('')
  const [expMsg, setExpMsg] = useState('')

  const hdrs = (): Record<string, string> => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  })

  const fetchBalance = useCallback(async () => {
    const r = await fetch('/api/auth/me', { headers: hdrs() })
    const j = await r.json()
    if (j.success) setBalance(j.data.balance ?? 0)
  }, [])

  const fetchSummary = useCallback(async () => {
    const [sr, tr] = await Promise.all([
      fetch('/api/dashboard/summary', { headers: hdrs() }),
      fetch(`/api/dashboard/trends?period=${trendPeriod}`, { headers: hdrs() }),
    ])
    const sj = await sr.json()
    const tj = await tr.json()
    if (sj.success) setSummary(sj.data)
    if (tj.success) setTrends(tj.data)
  }, [trendPeriod])

  const fetchHistory = useCallback(async () => {
    setHistErr('')
    const p = new URLSearchParams()
    if (filterType) p.set('type', filterType)
    if (filterCat) p.set('category', filterCat)
    if (filterStart) p.set('startDate', filterStart)
    if (filterEnd) p.set('endDate', filterEnd)
    if (showDeleted) p.set('includeDeleted', 'true')
    if (filterUserId) p.set('filterUserId', filterUserId)
    const [rr, tr] = await Promise.all([
      fetch(`/api/records?${p}`, { headers: hdrs() }),
      fetch('/api/transfers', { headers: hdrs() }),
    ])
    const rj = await rr.json()
    const tj = await tr.json()
    if (rj.success) setRecords(rj.data)
    else setHistErr(rj.message || 'Failed to load')
    if (tj.success) setTransfers(tj.data)
  }, [filterType, filterCat, filterStart, filterEnd, showDeleted, filterUserId])

  const fetchUsers = useCallback(async () => {
    const r = await fetch('/api/users', { headers: hdrs() })
    const j = await r.json()
    if (j.success) setUsers(j.data)
  }, [])

  const fetchInvites = useCallback(async () => {
    const r = await fetch('/api/invites', { headers: hdrs() })
    const j = await r.json()
    if (j.success) setInvites(j.data)
  }, [])

  const fetchAudit = useCallback(async () => {
    const q = auditEntity ? `?entity=${auditEntity}` : ''
    const r = await fetch(`/api/audit${q}`, { headers: hdrs() })
    const j = await r.json()
    if (j.success) setAuditLogs(j.data)
  }, [auditEntity])

  useEffect(() => {
    setName(localStorage.getItem('name') || 'Admin')
    setAdminId(localStorage.getItem('userId') || '')
    fetchBalance()
    fetchUsers()
  }, [fetchBalance, fetchUsers])

  useEffect(() => {
    if (tab === 'dashboard') {
      fetchSummary()
      fetchBalance()
    }
  }, [tab, fetchSummary, fetchBalance])
  useEffect(() => {
    if (tab === 'history') fetchHistory()
  }, [tab, fetchHistory])
  useEffect(() => {
    if (tab === 'send' || tab === 'add') fetchBalance()
  }, [tab, fetchBalance])
  useEffect(() => {
    if (tab === 'users') fetchUsers()
  }, [tab, fetchUsers])
  useEffect(() => {
    if (tab === 'invites') fetchInvites()
  }, [tab, fetchInvites])
  useEffect(() => {
    if (tab === 'audit') fetchAudit()
  }, [tab, fetchAudit])
  useEffect(() => {
    if (tab === 'dashboard') fetchSummary()
  }, [trendPeriod])

  // Build unified history rows
  const historyRows: HistoryRow[] = useMemo(() => {
    const rows: HistoryRow[] = []
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
          userId: r.userId ?? u?.id ?? '',
        })
      })
    }
    if (showKind !== 'records') {
      transfers
        .filter((t) => {
          if (
            filterUserId &&
            t.from.id !== filterUserId &&
            t.to.id !== filterUserId
          )
            return false
          if (filterStart && new Date(t.createdAt) < new Date(filterStart))
            return false
          if (
            filterEnd &&
            new Date(t.createdAt) > new Date(filterEnd + 'T23:59:59')
          )
            return false
          return true
        })
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
          r.userName.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q),
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

  // Budget alerts: current month spending per category
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

  // Anomaly detection: flag if record > 3x average for its category
  const categoryAvg = useMemo(() => {
    const sums: Record<string, number> = {}
    const counts: Record<string, number> = {}
    records
      .filter((r) => !r.deletedAt)
      .forEach((r) => {
        sums[r.category] = (sums[r.category] || 0) + r.amount
        counts[r.category] = (counts[r.category] || 0) + 1
      })
    const avg: Record<string, number> = {}
    Object.keys(sums).forEach((k) => {
      avg[k] = sums[k] / counts[k]
    })
    return avg
  }, [records])

  function isAnomaly(row: HistoryRow) {
    const avg = categoryAvg[row.category]
    return avg && row.amount > avg * 3
  }

  // Period comparison: this month vs last month
  const periodComparison = useMemo(() => {
    const now = new Date()
    const thisMonth = { income: 0, expense: 0 }
    const lastMonth = { income: 0, expense: 0 }
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
          if (r.type === 'INCOME') thisMonth.income += r.amount
          else thisMonth.expense += r.amount
        }
        if (isLast) {
          if (r.type === 'INCOME') lastMonth.income += r.amount
          else lastMonth.expense += r.amount
        }
      })
    return { thisMonth, lastMonth }
  }, [records])

  async function softDelete(id: string) {
    const r = await fetch(`/api/records/${id}`, {
      method: 'DELETE',
      headers: hdrs(),
    })
    const j = await r.json()
    if (j.success) {
      setHistMsg('Deleted.')
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
      setHistMsg('Restored.')
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
        setRecMsg('Record added!')
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
    if (!toEmail || !amount) {
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
          amount: parseFloat(amount),
          notes: txNotes,
        }),
      })
      const j = await r.json()
      if (j.success) {
        setTxMsg(j.data.message)
        setToEmail('')
        setAmount('')
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
    setInvToken('')
    if (!invEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invEmail)) {
      setInvErr('Valid email required.')
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
        setInvMsg(`Invite sent to ${j.data.email}`)
        setInvUrl(j.data.inviteUrl || '')
        setInvToken(j.data.token || '')
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
    setExpMsg(`Exported as ${expFormat.toUpperCase()}.`)
  }
  function logout() {
    localStorage.clear()
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

  // Budget alerts for dashboard
  const budgetAlerts = useMemo(
    () =>
      Object.entries(budgets)
        .map(([cat, limit]) => ({
          cat,
          limit,
          spent: currentMonthSpend[cat] || 0,
        }))
        .filter(({ spent, limit }) => spent > 0)
        .sort((a, b) => pct(b.spent, b.limit) - pct(a.spent, a.limit)),
    [budgets, currentMonthSpend],
  )

  return (
    <div style={S.page}>
      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.logo}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={S.logoText}>FinanceApp</span>
            <span style={S.logoBadge}>ADMIN</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', color: '#64748b' }}>
            {name}
          </div>
          <div
            style={{
              marginTop: '4px',
              fontSize: '13px',
              color: '#34d399',
              fontWeight: 600,
            }}
          >
            {fmt(balance)}
          </div>
        </div>
        {NAV.map((n) => (
          <button
            key={n.id}
            style={{ ...S.navBtn, ...(tab === n.id ? S.navBtnActive : {}) }}
            onClick={() => setTab(n.id)}
          >
            <span>{n.icon}</span>
            {n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={{ ...S.navBtn, color: '#f87171' }} onClick={logout}>
          🚪 Logout
        </button>
      </div>

      <div style={S.main}>
        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Summary stat cards */}
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
                  color: '#34d399',
                  icon: '📈',
                },
                {
                  label: 'Total Expenses',
                  value: fmt(summary?.totalExpense ?? 0),
                  color: '#f87171',
                  icon: '📉',
                },
                {
                  label: 'Net Balance',
                  value: fmt(summary?.netBalance ?? 0),
                  color:
                    (summary?.netBalance ?? 0) >= 0 ? '#34d399' : '#f87171',
                  icon: '💰',
                },
                {
                  label: 'My Balance',
                  value: fmt(balance),
                  color: '#818cf8',
                  icon: '👤',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{ ...S.card, textAlign: 'center' as const }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {s.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: s.color,
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Period comparison: this month vs last month */}
            <div style={S.card}>
              <h2 style={S.h2}>📅 This Month vs Last Month</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                }}
              >
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
                        padding: '16px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#64748b',
                          marginBottom: '8px',
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
                          <div style={{ fontSize: '11px', color: '#475569' }}>
                            This month
                          </div>
                          <div
                            style={{
                              fontSize: '18px',
                              fontWeight: 700,
                              color: type === 'Income' ? '#34d399' : '#f87171',
                            }}
                          >
                            {fmt(thisVal)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' as const }}>
                          <div style={{ fontSize: '11px', color: '#475569' }}>
                            Last month
                          </div>
                          <div style={{ fontSize: '14px', color: '#64748b' }}>
                            {fmt(lastVal)}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: isGood ? '#34d399' : '#f87171',
                          fontWeight: 600,
                        }}
                      >
                        {diff >= 0 ? '▲' : '▼'} {fmt(Math.abs(diff))}{' '}
                        {isGood ? '(better)' : '(worse)'}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Trend chart (bar-style inline) */}
            <div style={S.card}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <h2 style={{ ...S.h2, marginBottom: 0 }}>
                  📊 {trendPeriod === 'monthly' ? 'Monthly' : 'Weekly'} Trends
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['monthly', 'weekly'] as const).map((p) => (
                    <button
                      key={p}
                      style={trendPeriod === p ? S.btn : S.btnOutline}
                      onClick={() => setTrendPeriod(p)}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {trends.length === 0 ? (
                <div style={{ color: '#475569', fontSize: '14px' }}>
                  No trend data yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      minWidth: `${trends.length * 80}px`,
                      alignItems: 'flex-end',
                      height: '180px',
                      paddingBottom: '24px',
                      position: 'relative',
                    }}
                  >
                    {trends.map((t) => {
                      const maxVal = Math.max(
                        ...trends.flatMap((x) => [x.income, x.expense]),
                        1,
                      )
                      const incH = Math.round((t.income / maxVal) * 140)
                      const expH = Math.round((t.expense / maxVal) * 140)
                      return (
                        <div
                          key={t.period}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            flex: 1,
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
                                width: '20px',
                                height: `${incH}px`,
                                background: 'rgba(52,211,153,0.7)',
                                borderRadius: '4px 4px 0 0',
                                minHeight: '4px',
                              }}
                            />
                            <div
                              title={`Expense: ${fmt(t.expense)}`}
                              style={{
                                width: '20px',
                                height: `${expH}px`,
                                background: 'rgba(248,113,113,0.7)',
                                borderRadius: '4px 4px 0 0',
                                minHeight: '4px',
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              color: '#64748b',
                              textAlign: 'center' as const,
                              marginTop: '4px',
                            }}
                          >
                            {t.period}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div
                    style={{ display: 'flex', gap: '16px', marginTop: '8px' }}
                  >
                    <span style={{ fontSize: '12px', color: '#34d399' }}>
                      ■ Income
                    </span>
                    <span style={{ fontSize: '12px', color: '#f87171' }}>
                      ■ Expense
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
              }}
            >
              {/* Category totals */}
              <div style={S.card}>
                <h2 style={S.h2}>🗂️ Category Breakdown</h2>
                {(summary?.categoryTotals ?? []).length === 0 ? (
                  <div style={{ color: '#475569', fontSize: '14px' }}>
                    No data yet.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    {(summary?.categoryTotals ?? []).slice(0, 8).map((ct) => {
                      const total = summary?.totalExpense || 1
                      const width = pct(ct.total, total)
                      return (
                        <div key={ct.category}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '4px',
                            }}
                          >
                            <span
                              style={{ fontSize: '13px', color: '#cbd5e1' }}
                            >
                              {ct.category}
                            </span>
                            <span
                              style={{
                                fontSize: '13px',
                                color: '#94a3b8',
                                fontWeight: 600,
                              }}
                            >
                              {fmt(ct.total)}
                            </span>
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
                                width: `${width}%`,
                                background:
                                  'linear-gradient(90deg,#6366f1,#818cf8)',
                                borderRadius: '3px',
                                transition: 'width 0.4s',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Budget alerts */}
              <div style={S.card}>
                <h2 style={S.h2}>🎯 Budget Tracker (This Month)</h2>
                {budgetAlerts.length === 0 ? (
                  <div style={{ color: '#475569', fontSize: '14px' }}>
                    No spending recorded this month.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {budgetAlerts.map(({ cat, limit, spent }) => {
                      const p = pct(spent, limit)
                      const over = spent > limit
                      const warn = p >= 80
                      const barColor = over
                        ? '#f87171'
                        : warn
                          ? '#fbbf24'
                          : '#34d399'
                      return (
                        <div key={cat}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '4px',
                              alignItems: 'center',
                            }}
                          >
                            <span
                              style={{ fontSize: '13px', color: '#cbd5e1' }}
                            >
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
                                    fontSize: '11px',
                                    color: '#f87171',
                                    fontWeight: 700,
                                  }}
                                >
                                  OVER BUDGET
                                </span>
                              )}
                              {editBudgetCat === cat ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <input
                                    style={{
                                      ...S.input,
                                      width: '80px',
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
                                        [cat]:
                                          parseFloat(editBudgetVal) || limit,
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
                                    padding: '2px 6px',
                                    fontSize: '11px',
                                  }}
                                  onClick={() => {
                                    setEditBudgetCat(cat)
                                    setEditBudgetVal(String(limit))
                                  }}
                                >
                                  {fmt(spent)} / {fmt(limit)}
                                </button>
                              )}
                            </div>
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
                                width: `${Math.min(p, 100)}%`,
                                background: barColor,
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
                        marginTop: '4px',
                      }}
                    >
                      Click any budget to edit the limit.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent activity */}
            {(summary?.recentActivity ?? []).length > 0 && (
              <div style={S.card}>
                <h2 style={S.h2}>⚡ Recent Activity</h2>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {summary!.recentActivity.slice(0, 8).map((a) => (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
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
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: ac(a.user.name),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          {a.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: '13px',
                              color: '#f1f5f9',
                              fontWeight: 600,
                            }}
                          >
                            {a.user.name}
                          </span>
                          <span style={{ fontSize: '13px', color: '#64748b' }}>
                            {' '}
                            ·{' '}
                          </span>
                          <span style={{ ...S.badge, ...bc(a.action) }}>
                            {a.action}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
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
              </div>
            )}

            {/* User stats */}
            <div style={S.card}>
              <h2 style={S.h2}>👥 User Overview</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: '16px',
                }}
              >
                {[
                  {
                    label: 'Total Users',
                    value: users.length,
                    color: '#818cf8',
                  },
                  {
                    label: 'Active Users',
                    value: users.filter((u) => u.isActive).length,
                    color: '#34d399',
                  },
                  {
                    label: 'Admins',
                    value: users.filter((u) => u.role === 'ADMIN').length,
                    color: '#f87171',
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'center' as const,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginTop: '4px',
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div style={S.card}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h2 style={{ ...S.h2, marginBottom: 0 }}>Transaction History</h2>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#94a3b8',
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

            {/* Search bar */}
            <div style={{ marginBottom: '16px' }}>
              <input
                style={{ ...S.input, maxWidth: '400px' }}
                placeholder="🔍 Search notes, category, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={S.filterRow}>
              <div style={{ flex: 2, minWidth: '180px' }}>
                <label style={S.label}>View as User</label>
                <select
                  style={S.input}
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                >
                  <option value="">All Users</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '140px' }}>
                <label style={S.label}>Show</label>
                <select
                  style={S.input}
                  value={showKind}
                  onChange={(e) =>
                    setShowKind(
                      e.target.value as 'all' | 'records' | 'transfers',
                    )
                  }
                >
                  <option value="all">Records + Transfers</option>
                  <option value="records">Records only</option>
                  <option value="transfers">Transfers only</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '110px' }}>
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
              {showKind !== 'transfers' && (
                <div style={{ flex: 1, minWidth: '130px' }}>
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
              )}
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={S.label}>From</label>
                <input
                  style={S.input}
                  type="date"
                  value={filterStart}
                  onChange={(e) => setFilterStart(e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
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

            {/* Result count */}
            <div
              style={{
                fontSize: '12px',
                color: '#475569',
                marginBottom: '12px',
              }}
            >
              Showing {historyRows.length} result
              {historyRows.length !== 1 ? 's' : ''}
            </div>

            {histMsg && <div style={S.success}>{histMsg}</div>}
            {histErr && <div style={S.errorBox}>{histErr}</div>}
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
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
                      style={{
                        opacity: row.deletedAt ? 0.5 : 1,
                        background: isAnomaly(row)
                          ? 'rgba(245,158,11,0.05)'
                          : 'transparent',
                      }}
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
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: ac(row.userName),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {row.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#f1f5f9',
                              }}
                            >
                              {row.userName}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {row.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...bc(row.type) }}>
                          {row.type}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ ...S.badge, ...bc(row.category) }}>
                            {row.category}
                          </span>
                          {isAnomaly(row) && (
                            <span
                              title="Unusually high for this category"
                              style={{ fontSize: '14px' }}
                            >
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          ...S.td,
                          fontWeight: 700,
                          color: row.type === 'INCOME' ? '#34d399' : '#f87171',
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
                          color: '#94a3b8',
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
                            ...(row.kind === 'transfer'
                              ? {
                                  background: 'rgba(245,158,11,0.15)',
                                  color: '#fbbf24',
                                }
                              : {
                                  background: 'rgba(99,102,241,0.15)',
                                  color: '#818cf8',
                                }),
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
                            ...(row.deletedAt
                              ? {
                                  background: 'rgba(239,68,68,0.15)',
                                  color: '#f87171',
                                }
                              : {
                                  background: 'rgba(16,185,129,0.15)',
                                  color: '#34d399',
                                }),
                          }}
                        >
                          {row.deletedAt ? 'Deleted' : 'Active'}
                        </span>
                      </td>
                      <td style={S.td}>
                        {row.kind === 'transfer' ? (
                          <span style={{ color: '#475569', fontSize: '12px' }}>
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
                          color: '#64748b',
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
          </div>
        )}

        {/* ── ADD RECORD ── */}
        {tab === 'add' && (
          <div style={S.card}>
            <h2 style={S.h2}>Add Record</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                maxWidth: '600px',
              }}
            >
              <div>
                <label style={S.label}>Type</label>
                <select
                  style={S.input}
                  value={recType}
                  onChange={(e) =>
                    setRecType(e.target.value as 'INCOME' | 'EXPENSE')
                  }
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
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
            {/* Budget hint for selected category */}
            {recType === 'EXPENSE' && budgets[recCat] && (
              <div
                style={{
                  marginTop: '12px',
                  fontSize: '13px',
                  color:
                    (currentMonthSpend[recCat] || 0) >= budgets[recCat]
                      ? '#f87171'
                      : '#fbbf24',
                }}
              >
                💡 Budget for {recCat}: {fmt(currentMonthSpend[recCat] || 0)}{' '}
                spent / {fmt(budgets[recCat])} limit this month
              </div>
            )}
            {recMsg && (
              <div style={{ ...S.success, marginTop: '16px' }}>{recMsg}</div>
            )}
            {recErr && (
              <div style={{ ...S.errorBox, marginTop: '16px' }}>{recErr}</div>
            )}
            <button
              style={{ ...S.btn, marginTop: '20px' }}
              onClick={addRecord}
              disabled={recLoading}
            >
              {recLoading ? 'Saving...' : '➕ Add Record'}
            </button>
          </div>
        )}

        {/* ── SEND MONEY ── */}
        {tab === 'send' && (
          <div style={S.card}>
            <h2 style={S.h2}>Send Money</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                maxWidth: '600px',
                marginBottom: '16px',
              }}
            >
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={S.label}>Notes (optional)</label>
                <input
                  style={S.input}
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="Payment for..."
                />
              </div>
            </div>
            {/* Warn if amount exceeds balance */}
            {amount && parseFloat(amount) > balance && (
              <div style={{ ...S.errorBox, marginBottom: '12px' }}>
                ⚠️ Amount exceeds your current balance of {fmt(balance)}
              </div>
            )}
            {txMsg && <div style={S.success}>{txMsg}</div>}
            {txErr && <div style={S.errorBox}>{txErr}</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                style={S.btnGreen}
                onClick={sendMoney}
                disabled={
                  txLoading || (!!amount && parseFloat(amount) > balance)
                }
              >
                {txLoading ? 'Sending...' : '💸 Send Money'}
              </button>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Balance:{' '}
                <strong style={{ color: '#34d399' }}>{fmt(balance)}</strong>
              </span>
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
                marginBottom: '16px',
              }}
            >
              <h2 style={{ ...S.h2, marginBottom: 0 }}>Manage Users</h2>
              <input
                style={{ ...S.input, width: '240px' }}
                placeholder="🔍 Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            {userMsg && <div style={S.success}>{userMsg}</div>}
            {userErr && <div style={S.errorBox}>{userErr}</div>}
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {[
                      'Name',
                      'Email',
                      'Role',
                      'Balance',
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
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
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
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: ac(u.name),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#fff',
                            }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>
                              {u.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {u.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>{u.email}</td>
                      <td style={S.td}>
                        <select
                          style={{
                            ...S.input,
                            width: 'auto',
                            padding: '4px 8px',
                            fontSize: '12px',
                          }}
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                        >
                          <option value="VIEWER">VIEWER</option>
                          <option value="ANALYST">ANALYST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td
                        style={{ ...S.td, color: '#34d399', fontWeight: 600 }}
                      >
                        {fmt(u.balance)}
                      </td>
                      <td style={S.td}>
                        <span
                          style={{
                            ...S.badge,
                            ...(u.isActive
                              ? {
                                  background: 'rgba(16,185,129,0.15)',
                                  color: '#34d399',
                                }
                              : {
                                  background: 'rgba(239,68,68,0.15)',
                                  color: '#f87171',
                                }),
                          }}
                        >
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td
                        style={{
                          ...S.td,
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap',
                        }}
                      >
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
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        style={{
                          ...S.td,
                          textAlign: 'center',
                          color: '#64748b',
                        }}
                        colSpan={6}
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── INVITES ── */}
        {tab === 'invites' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div style={S.card}>
              <h2 style={S.h2}>Create Invite</h2>
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
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#64748b',
                      marginBottom: '6px',
                    }}
                  >
                    Invite link:
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#818cf8',
                      wordBreak: 'break-all',
                      marginBottom: '10px',
                    }}
                  >
                    {invUrl}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={S.btnOutline}
                      onClick={async () => {
                        await navigator.clipboard.writeText(invUrl)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                    >
                      {copied ? '✅ Copied!' : '📋 Copy'}
                    </button>
                    <button
                      style={S.btnOutline}
                      onClick={() => window.open(invUrl, '_blank')}
                    >
                      🔗 Open
                    </button>
                  </div>
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#475569',
                      fontFamily: 'monospace',
                    }}
                  >
                    Token: {invToken.slice(0, 20)}...
                  </div>
                </div>
              )}
              <button
                style={S.btn}
                onClick={createInvite}
                disabled={invLoading}
              >
                {invLoading ? 'Creating...' : '✉️ Send Invite'}
              </button>
            </div>
            <div style={S.card}>
              <h2 style={S.h2}>All Invites</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
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
                      const sc: React.CSSProperties = inv.usedAt
                        ? {
                            background: 'rgba(148,163,184,0.15)',
                            color: '#94a3b8',
                          }
                        : expired
                          ? {
                              background: 'rgba(239,68,68,0.15)',
                              color: '#f87171',
                            }
                          : {
                              background: 'rgba(16,185,129,0.15)',
                              color: '#34d399',
                            }
                      return (
                        <tr key={inv.id}>
                          <td style={S.td}>{inv.email}</td>
                          <td style={S.td}>
                            <span style={{ ...S.badge, ...bc(inv.role) }}>
                              {inv.role}
                            </span>
                          </td>
                          <td style={S.td}>{inv.creator.name}</td>
                          <td style={S.td}>
                            {new Date(inv.expiresAt).toLocaleDateString()}
                          </td>
                          <td style={S.td}>
                            <span style={{ ...S.badge, ...sc }}>{status}</span>
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
                            color: '#64748b',
                          }}
                          colSpan={5}
                        >
                          No invites yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
              <h2 style={{ ...S.h2, marginBottom: 0, flex: 1 }}>Audit Logs</h2>
              <select
                style={{ ...S.input, width: '180px' }}
                value={auditEntity}
                onChange={(e) => setAuditEntity(e.target.value)}
              >
                <option value="">All Entities</option>
                <option value="FinancialRecord">FinancialRecord</option>
                <option value="Transfer">Transfer</option>
                <option value="InviteToken">InviteToken</option>
                <option value="User">User</option>
              </select>
              <button style={S.btn} onClick={fetchAudit}>
                Refresh
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
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
                        {log.user.name}
                        <br />
                        <span style={{ color: '#64748b', fontSize: '12px' }}>
                          {log.user.email}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...bc(log.action) }}>
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
                        style={{
                          ...S.td,
                          textAlign: 'center',
                          color: '#64748b',
                        }}
                        colSpan={5}
                      >
                        No logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── EXPORT ── */}
        {tab === 'export' && (
          <div style={S.card}>
            <h2 style={S.h2}>Export Records</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                maxWidth: '520px',
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
              style={{ ...S.btnGreen, marginTop: '20px' }}
              onClick={handleExport}
            >
              📥 Export {expFormat.toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
