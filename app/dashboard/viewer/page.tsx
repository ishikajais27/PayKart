// 'use client'
// import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'

// type Tab = 'history' | 'audit' | 'export'

// interface FinancialRecord {
//   id: string
//   amount: number
//   type: 'INCOME' | 'EXPENSE'
//   category: string
//   date: string
//   notes?: string
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
// interface HistoryRow {
//   id: string
//   kind: 'record' | 'transfer'
//   amount: number
//   type: 'INCOME' | 'EXPENSE'
//   category: string
//   date: string
//   notes?: string
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
//     background: 'rgba(16,185,129,0.15)',
//     border: '1px solid rgba(16,185,129,0.3)',
//     color: '#34d399',
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
//   btnOutline: {
//     padding: '7px 14px',
//     background: 'rgba(99,102,241,0.12)',
//     color: '#818cf8',
//     border: '1px solid rgba(99,102,241,0.3)',
//     borderRadius: '6px',
//     fontSize: '13px',
//     cursor: 'pointer',
//   },
//   badge: {
//     display: 'inline-block',
//     padding: '2px 8px',
//     borderRadius: '4px',
//     fontSize: '11px',
//     fontWeight: 600,
//     letterSpacing: '0.04em',
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
//   success: {
//     background: 'rgba(16,185,129,0.1)',
//     border: '1px solid rgba(16,185,129,0.25)',
//     color: '#34d399',
//     padding: '12px 16px',
//     borderRadius: '10px',
//     fontSize: '14px',
//     marginBottom: '16px',
//   },
//   filterRow: {
//     display: 'flex',
//     gap: '12px',
//     marginBottom: '20px',
//     flexWrap: 'wrap' as const,
//     alignItems: 'flex-end',
//   },
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
// }

// const NAV: { id: Tab; label: string; icon: string }[] = [
//   { id: 'history', label: 'History', icon: '📋' },
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
//   if (['INCOME', 'RESTORE'].includes(v))
//     return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
//   if (['EXPENSE', 'SOFT_DELETE'].includes(v))
//     return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
//   if (['UPDATE', 'CREATE'].includes(v))
//     return { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
//   if (v === 'Transfer Out')
//     return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
//   if (v === 'Transfer In')
//     return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
//   return { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
// }

// export default function ViewerDashboard() {
//   const router = useRouter()
//   const [tab, setTab] = useState<Tab>('history')
//   const [name, setName] = useState('')
//   const [userId, setUserId] = useState('')
//   const [balance, setBalance] = useState(0)

//   const [records, setRecords] = useState<FinancialRecord[]>([])
//   const [transfers, setTransfers] = useState<Transfer[]>([])
//   const [showKind, setShowKind] = useState<'all' | 'records' | 'transfers'>(
//     'all',
//   )
//   const [filterType, setFilterType] = useState('')
//   const [filterCat, setFilterCat] = useState('')
//   const [filterStart, setFilterStart] = useState('')
//   const [filterEnd, setFilterEnd] = useState('')
//   const [histErr, setHistErr] = useState('')

//   const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
//   const [auditEntity, setAuditEntity] = useState('')

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
//     const [rr, tr] = await Promise.all([
//       fetch(`/api/records?${p}`, { headers: hdrs() }),
//       fetch('/api/transfers', { headers: hdrs() }),
//     ])
//     const rj = await rr.json()
//     const tj = await tr.json()
//     if (rj.success) setRecords(rj.data)
//     else setHistErr(rj.message || 'Failed to load')
//     if (tj.success) setTransfers(tj.data)
//   }, [filterType, filterCat, filterStart, filterEnd])

//   const fetchAudit = useCallback(async () => {
//     const q = auditEntity ? `?entity=${auditEntity}` : ''
//     const r = await fetch(`/api/audit${q}`, { headers: hdrs() })
//     const j = await r.json()
//     if (j.success) setAuditLogs(j.data)
//   }, [auditEntity])

//   useEffect(() => {
//     const uid = localStorage.getItem('userId') || ''
//     setName(localStorage.getItem('name') || 'Viewer')
//     setUserId(uid)
//     fetchBalance()
//     fetchHistory()
//   }, [fetchBalance, fetchHistory])

//   useEffect(() => {
//     if (tab === 'history') fetchHistory()
//   }, [tab, fetchHistory])
//   useEffect(() => {
//     if (tab === 'audit') fetchAudit()
//   }, [tab, fetchAudit])

//   const historyRows: HistoryRow[] = (() => {
//     const rows: HistoryRow[] = []
//     if (showKind !== 'transfers')
//       records.forEach((r) =>
//         rows.push({
//           id: r.id,
//           kind: 'record',
//           amount: r.amount,
//           type: r.type,
//           category: r.category,
//           date: r.date,
//           notes: r.notes,
//         }),
//       )
//     if (showKind !== 'records') {
//       transfers
//         .filter((t) => {
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
//           if (t.from.id === userId)
//             rows.push({
//               id: `tx_out_${t.id}`,
//               kind: 'transfer',
//               amount: t.amount,
//               type: 'EXPENSE',
//               category: 'Transfer Out',
//               date: t.createdAt,
//               notes: `→ ${t.to.name}${t.notes ? ` — ${t.notes}` : ''}`,
//             })
//           if (t.to.id === userId)
//             rows.push({
//               id: `tx_in_${t.id}`,
//               kind: 'transfer',
//               amount: t.amount,
//               type: 'INCOME',
//               category: 'Transfer In',
//               date: t.createdAt,
//               notes: `← ${t.from.name}${t.notes ? ` — ${t.notes}` : ''}`,
//             })
//         })
//     }
//     const typed = filterType ? rows.filter((r) => r.type === filterType) : rows
//     return typed.sort(
//       (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
//     )
//   })()

//   const totalIn = historyRows
//     .filter((r) => r.type === 'INCOME')
//     .reduce((s, r) => s + r.amount, 0)
//   const totalOut = historyRows
//     .filter((r) => r.type === 'EXPENSE')
//     .reduce((s, r) => s + r.amount, 0)

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
//             <span style={S.logoBadge}>VIEWER</span>
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
//           <div>
//             {/* Summary cards */}
//             <div
//               style={{
//                 display: 'grid',
//                 gridTemplateColumns: '1fr 1fr 1fr',
//                 gap: '16px',
//                 marginBottom: '24px',
//               }}
//             >
//               {[
//                 {
//                   label: 'BALANCE',
//                   value: `₹${balance.toLocaleString('en-IN')}`,
//                   color: '#818cf8',
//                   bg: 'rgba(99,102,241,0.08)',
//                   border: 'rgba(99,102,241,0.2)',
//                 },
//                 {
//                   label: 'TOTAL IN',
//                   value: `₹${totalIn.toLocaleString('en-IN')}`,
//                   color: '#34d399',
//                   bg: 'rgba(16,185,129,0.08)',
//                   border: 'rgba(16,185,129,0.2)',
//                 },
//                 {
//                   label: 'TOTAL OUT',
//                   value: `₹${totalOut.toLocaleString('en-IN')}`,
//                   color: '#f87171',
//                   bg: 'rgba(239,68,68,0.08)',
//                   border: 'rgba(239,68,68,0.2)',
//                 },
//               ].map((s) => (
//                 <div
//                   key={s.label}
//                   style={{
//                     background: s.bg,
//                     border: `1px solid ${s.border}`,
//                     borderRadius: '14px',
//                     padding: '20px 24px',
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontSize: '11px',
//                       color: '#64748b',
//                       fontWeight: 600,
//                       letterSpacing: '0.06em',
//                       marginBottom: '8px',
//                     }}
//                   >
//                     {s.label}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: '22px',
//                       fontWeight: 700,
//                       color: s.color,
//                     }}
//                   >
//                     {s.value}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={S.card}>
//               <h2 style={S.h2}>My Transaction History</h2>
//               <div style={S.filterRow}>
//                 <div style={{ flex: 1, minWidth: '140px' }}>
//                   <label style={S.label}>Show</label>
//                   <select
//                     style={S.input}
//                     value={showKind}
//                     onChange={(e) =>
//                       setShowKind(
//                         e.target.value as 'all' | 'records' | 'transfers',
//                       )
//                     }
//                   >
//                     <option value="all">Records + Transfers</option>
//                     <option value="records">Records only</option>
//                     <option value="transfers">Transfers only</option>
//                   </select>
//                 </div>
//                 <div style={{ flex: 1, minWidth: '110px' }}>
//                   <label style={S.label}>Type</label>
//                   <select
//                     style={S.input}
//                     value={filterType}
//                     onChange={(e) => setFilterType(e.target.value)}
//                   >
//                     <option value="">All</option>
//                     <option value="INCOME">Income</option>
//                     <option value="EXPENSE">Expense</option>
//                   </select>
//                 </div>
//                 {showKind !== 'transfers' && (
//                   <div style={{ flex: 1, minWidth: '130px' }}>
//                     <label style={S.label}>Category</label>
//                     <select
//                       style={S.input}
//                       value={filterCat}
//                       onChange={(e) => setFilterCat(e.target.value)}
//                     >
//                       <option value="">All</option>
//                       {CATS.map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
//                 <div style={{ flex: 1, minWidth: '120px' }}>
//                   <label style={S.label}>From</label>
//                   <input
//                     style={S.input}
//                     type="date"
//                     value={filterStart}
//                     onChange={(e) => setFilterStart(e.target.value)}
//                   />
//                 </div>
//                 <div style={{ flex: 1, minWidth: '120px' }}>
//                   <label style={S.label}>To</label>
//                   <input
//                     style={S.input}
//                     type="date"
//                     value={filterEnd}
//                     onChange={(e) => setFilterEnd(e.target.value)}
//                   />
//                 </div>
//                 <div
//                   style={{
//                     display: 'flex',
//                     gap: '8px',
//                     alignItems: 'flex-end',
//                   }}
//                 >
//                   <button style={S.btn} onClick={fetchHistory}>
//                     Apply
//                   </button>
//                   <button
//                     style={S.btnOutline}
//                     onClick={() => {
//                       setFilterType('')
//                       setFilterCat('')
//                       setFilterStart('')
//                       setFilterEnd('')
//                       setShowKind('all')
//                     }}
//                   >
//                     Clear
//                   </button>
//                 </div>
//               </div>
//               {histErr && <div style={S.errorBox}>{histErr}</div>}
//               <div style={{ overflowX: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                   <thead>
//                     <tr>
//                       {[
//                         'Type',
//                         'Category',
//                         'Amount',
//                         'Date',
//                         'Notes',
//                         'Source',
//                       ].map((h) => (
//                         <th key={h} style={S.th}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {historyRows.map((row) => (
//                       <tr key={row.id}>
//                         <td style={S.td}>
//                           <span style={{ ...S.badge, ...bc(row.type) }}>
//                             {row.type}
//                           </span>
//                         </td>
//                         <td style={S.td}>
//                           <span style={{ ...S.badge, ...bc(row.category) }}>
//                             {row.category}
//                           </span>
//                         </td>
//                         <td
//                           style={{
//                             ...S.td,
//                             fontWeight: 700,
//                             color:
//                               row.type === 'INCOME' ? '#34d399' : '#f87171',
//                           }}
//                         >
//                           {row.type === 'INCOME' ? '+' : '−'}₹
//                           {row.amount.toLocaleString('en-IN')}
//                         </td>
//                         <td style={{ ...S.td, fontSize: '13px' }}>
//                           {new Date(row.date).toLocaleDateString('en-IN', {
//                             day: '2-digit',
//                             month: 'short',
//                             year: 'numeric',
//                           })}
//                         </td>
//                         <td
//                           style={{
//                             ...S.td,
//                             color: '#94a3b8',
//                             fontSize: '13px',
//                             maxWidth: '220px',
//                           }}
//                         >
//                           <div
//                             style={{
//                               overflow: 'hidden',
//                               textOverflow: 'ellipsis',
//                               whiteSpace: 'nowrap',
//                             }}
//                           >
//                             {row.notes || '—'}
//                           </div>
//                         </td>
//                         <td style={S.td}>
//                           <span
//                             style={{
//                               ...S.badge,
//                               ...(row.kind === 'transfer'
//                                 ? {
//                                     background: 'rgba(245,158,11,0.15)',
//                                     color: '#fbbf24',
//                                   }
//                                 : {
//                                     background: 'rgba(99,102,241,0.15)',
//                                     color: '#818cf8',
//                                   }),
//                             }}
//                           >
//                             {row.kind === 'transfer'
//                               ? '💸 Transfer'
//                               : '📋 Record'}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                     {historyRows.length === 0 && (
//                       <tr>
//                         <td
//                           style={{
//                             ...S.th,
//                             textAlign: 'center',
//                             padding: '48px',
//                             color: '#64748b',
//                           }}
//                           colSpan={6}
//                         >
//                           No transactions found
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
//               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
//                           ...S.th,
//                           textAlign: 'center',
//                           padding: '48px',
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
//             <h2 style={S.h2}>Export My Records</h2>
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

interface FinancialRecord {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
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
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.3)',
    color: '#34d399',
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
    marginBottom: '24px',
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
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px',
    textAlign: 'center' as const,
  },
  alertBox: {
    background: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.25)',
    color: '#fbbf24',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '10px',
  },
  infoBox: {
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    color: '#818cf8',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '13px',
    marginBottom: '10px',
  },
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

function bc(v: string): React.CSSProperties {
  if (['INCOME'].includes(v))
    return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
  if (['EXPENSE'].includes(v))
    return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
  if (['Transfer In'].includes(v))
    return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
  if (['Transfer Out'].includes(v))
    return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
  return { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
}
function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}
function ac(name: string) {
  const c = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return c[Math.abs(h) % c.length]
}

export default function ViewerDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [name, setName] = useState('')
  const [balance, setBalance] = useState(0)
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [userId, setUserId] = useState('')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
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
    } else {
      router.push('/login')
    }
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
  }, [fetchMe])
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Unified rows (viewer sees only their own)
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
    return result.sort((a, b) => {
      if (sortBy === 'amount')
        return sortDir === 'desc' ? b.amount - a.amount : a.amount - b.amount
      return sortDir === 'desc'
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }, [records, transfers, userId, search, filterType, sortBy, sortDir])

  // Dashboard stats
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

  // Top categories
  const catTotals = useMemo(() => {
    const m: Record<string, number> = {}
    thisMonthRows
      .filter((r) => r.type === 'EXPENSE')
      .forEach((r) => {
        m[r.category] = (m[r.category] || 0) + r.amount
      })
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }, [thisMonthRows])

  // Day of week spending
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

  // Biggest expense this month
  const biggestExpense = thisMonthRows
    .filter((r) => r.type === 'EXPENSE')
    .sort((a, b) => b.amount - a.amount)[0]

  // Spending streak (days under daily avg)
  const dailyAvg = thisExpense / (now.getDate() || 1)
  const streak = (() => {
    let s = 0
    for (let i = 0; i < now.getDate(); i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const daySpend = thisMonthRows
        .filter(
          (r) =>
            r.type === 'EXPENSE' &&
            new Date(r.date).toDateString() === d.toDateString(),
        )
        .reduce((sum, r) => sum + r.amount, 0)
      if (daySpend <= dailyAvg) s++
      else break
    }
    return s
  })()

  // Budget alerts (hardcoded viewer budgets, they can set savings goal only)
  const viewerBudgets: Record<string, number> = {
    Food: 8000,
    Travel: 5000,
    Entertainment: 3000,
    Shopping: 5000,
  }
  const budgetAlerts = Object.entries(viewerBudgets)
    .map(([cat, limit]) => {
      const spent = thisMonthRows
        .filter((r) => r.type === 'EXPENSE' && r.category === cat)
        .reduce((s, r) => s + r.amount, 0)
      return { cat, limit, spent, pct: Math.round((spent / limit) * 100) }
    })
    .filter(({ pct }) => pct >= 70)
    .sort((a, b) => b.pct - a.pct)

  // Unusual spike: today > 3x daily avg
  const spikeAlert = todaySpend > dailyAvg * 3 && dailyAvg > 0

  function logout() {
    localStorage.clear()
    router.push('/login')
  }

  return (
    <div style={S.page}>
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
            <span style={S.logoBadge}>VIEWER</span>
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
        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <>
            {/* Alerts */}
            {spikeAlert && (
              <div style={S.alertBox}>
                ⚠️ Unusual spike: You've spent {fmt(todaySpend)} today —{' '}
                {Math.round(todaySpend / dailyAvg)}x your daily average of{' '}
                {fmt(Math.round(dailyAvg))}
              </div>
            )}
            {budgetAlerts.map(({ cat, limit, spent, pct }) => (
              <div
                key={cat}
                style={{
                  ...S.alertBox,
                  color: pct >= 100 ? '#f87171' : '#fbbf24',
                  borderColor:
                    pct >= 100
                      ? 'rgba(239,68,68,0.3)'
                      : 'rgba(245,158,11,0.25)',
                  background:
                    pct >= 100
                      ? 'rgba(239,68,68,0.08)'
                      : 'rgba(245,158,11,0.08)',
                }}
              >
                {pct >= 100 ? '🔴' : '🟡'} {cat} budget: {fmt(spent)} /{' '}
                {fmt(limit)} ({pct}% used){pct >= 100 ? ' — OVER BUDGET' : ''}
              </div>
            ))}
            {streak >= 3 && (
              <div
                style={{
                  ...S.infoBox,
                  color: '#34d399',
                  borderColor: 'rgba(16,185,129,0.3)',
                  background: 'rgba(16,185,129,0.08)',
                }}
              >
                🔥 Spending streak: You've stayed at or under your daily average
                for {streak} days in a row!
              </div>
            )}

            {/* Stat cards */}
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
                  color: '#818cf8',
                  icon: '💰',
                },
                {
                  label: 'Income This Month',
                  value: fmt(thisIncome),
                  color: '#34d399',
                  icon: '📈',
                },
                {
                  label: 'Expenses This Month',
                  value: fmt(thisExpense),
                  color: '#f87171',
                  icon: '📉',
                },
                {
                  label: 'Spent Today',
                  value: fmt(todaySpend),
                  color: '#fbbf24',
                  icon: '🗓️',
                },
              ].map((s) => (
                <div key={s.label} style={S.statCard}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>
                    {s.icon}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#64748b',
                      marginBottom: '4px',
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
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
                gap: '24px',
                marginBottom: '24px',
              }}
            >
              {/* This month vs last month */}
              <div style={S.card}>
                <h2 style={S.h2}>📅 This Month vs Last Month</h2>
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
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#64748b',
                          marginBottom: '6px',
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
                              color: type === 'Income' ? '#34d399' : '#f87171',
                            }}
                          >
                            {fmt(thisVal)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' as const }}>
                          <div style={{ fontSize: '10px', color: '#475569' }}>
                            Last month
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b' }}>
                            {fmt(lastVal)}
                          </div>
                        </div>
                      </div>
                      {lastVal > 0 && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '12px',
                            color: isGood ? '#34d399' : '#f87171',
                            fontWeight: 600,
                          }}
                        >
                          {diff >= 0 ? '▲' : '▼'} {fmt(Math.abs(diff))} (
                          {Math.abs(
                            Math.round(((thisVal - lastVal) / lastVal) * 100),
                          )}
                          %) {isGood ? '✓' : '!'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Savings progress */}
              <div style={S.card}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <h2 style={{ ...S.h2, marginBottom: 0 }}>🎯 Savings Goal</h2>
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
                {editGoal ? (
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
                ) : null}
                <div
                  style={{ textAlign: 'center' as const, marginBottom: '16px' }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 700,
                      color: savingsPct >= 100 ? '#34d399' : '#818cf8',
                    }}
                  >
                    {savingsPct}%
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    {fmt(Math.max(thisSavings, 0))} of {fmt(savingsGoal)} goal
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
                {thisSavings < 0 && (
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '12px',
                      color: '#f87171',
                    }}
                  >
                    ⚠️ Expenses exceed income by {fmt(Math.abs(thisSavings))}{' '}
                    this month
                  </div>
                )}
                {savingsPct >= 100 && (
                  <div
                    style={{
                      marginTop: '10px',
                      fontSize: '13px',
                      color: '#34d399',
                      fontWeight: 600,
                    }}
                  >
                    🎉 Goal reached! Great job!
                  </div>
                )}
              </div>
            </div>

            {/* Day of week pattern */}
            <div style={S.card}>
              <h2 style={S.h2}>📆 Day-of-Week Spending Pattern</h2>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end',
                  height: '120px',
                  paddingBottom: '28px',
                }}
              >
                {dowSpend.map((d) => {
                  const h = Math.round((d.amount / maxDow) * 80)
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
                          background: isTop
                            ? '#f87171'
                            : 'rgba(99,102,241,0.5)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.4s',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '11px',
                          color: isTop ? '#f87171' : '#64748b',
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
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  You spend most on{' '}
                  <strong style={{ color: '#f87171' }}>{topDow.day}s</strong> —
                  avg {fmt(Math.round(topDow.amount / 4))}/week
                </div>
              )}
            </div>

            {/* Recent 5 transactions */}
            <div style={S.card}>
              <h2 style={S.h2}>⚡ Recent Transactions</h2>
              {allRows.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
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
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background:
                          r.type === 'INCOME'
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(239,68,68,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                      }}
                    >
                      {r.type === 'INCOME' ? '↑' : '↓'}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#f1f5f9',
                        }}
                      >
                        {r.category}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
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
                      fontSize: '15px',
                      fontWeight: 700,
                      color: r.type === 'INCOME' ? '#34d399' : '#f87171',
                    }}
                  >
                    {r.type === 'INCOME' ? '+' : '−'}
                    {fmt(r.amount)}
                  </div>
                </div>
              ))}
              {allRows.length === 0 && (
                <div style={{ color: '#475569', fontSize: '14px' }}>
                  No transactions yet.
                </div>
              )}
            </div>
          </>
        )}

        {/* ── RECORDS ── */}
        {tab === 'records' && (
          <div style={S.card}>
            <h2 style={S.h2}>My Records</h2>
            {/* Search & filters */}
            <div style={{ marginBottom: '16px' }}>
              <input
                style={{ ...S.input, maxWidth: '400px' }}
                placeholder="🔍 Search notes, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={S.filterRow}>
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
              <div style={{ flex: 1, minWidth: '110px' }}>
                <label style={S.label}>Sort By</label>
                <select
                  style={S.input}
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'date' | 'amount')
                  }
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '100px' }}>
                <label style={S.label}>Order</label>
                <select
                  style={S.input}
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as 'desc' | 'asc')}
                >
                  <option value="desc">High → Low</option>
                  <option value="asc">Low → High</option>
                </select>
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
                    setSortBy('date')
                    setSortDir('desc')
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
              <table style={S.table}>
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
                        <span style={{ ...S.badge, ...bc(row.type) }}>
                          {row.type}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...bc(row.category) }}>
                          {row.category}
                        </span>
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
                              row.source === 'Transfer' ? '#fbbf24' : '#818cf8',
                          }}
                        >
                          {row.source === 'Transfer'
                            ? '💸 Transfer'
                            : '📋 Record'}
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
                          color: '#64748b',
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

        {/* ── INSIGHTS (read-only) ── */}
        {tab === 'insights' && (
          <>
            <div style={S.card}>
              <h2 style={S.h2}>🏆 Top 3 Spending Categories This Month</h2>
              {catTotals.length === 0 ? (
                <div style={{ color: '#475569' }}>
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
                        background: ['#fbbf24', '#94a3b8', '#cd7c3e'][i],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#0a0f1e',
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
                            color: '#f1f5f9',
                            fontWeight: 600,
                          }}
                        >
                          {cat}
                        </span>
                        <span
                          style={{
                            fontSize: '14px',
                            color: '#f87171',
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
                            background: ['#fbbf24', '#94a3b8', '#cd7c3e'][i],
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={S.card}>
              <h2 style={S.h2}>💥 Biggest Expense This Month</h2>
              {biggestExpense ? (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(239,68,68,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                    }}
                  >
                    💸
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '22px',
                        fontWeight: 700,
                        color: '#f87171',
                      }}
                    >
                      {fmt(biggestExpense.amount)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
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
                <div style={{ color: '#475569' }}>No expenses this month.</div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
              }}
            >
              <div style={S.card}>
                <h2 style={S.h2}>📊 Income vs Expense</h2>
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-end',
                    height: '120px',
                  }}
                >
                  {[
                    { label: 'Income', val: thisIncome, color: '#34d399' },
                    { label: 'Expense', val: thisExpense, color: '#f87171' },
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
                          gap: '6px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '12px',
                            color: b.color,
                            fontWeight: 600,
                          }}
                        >
                          {fmt(b.val)}
                        </div>
                        <div
                          style={{
                            width: '60%',
                            height: `${Math.round((b.val / max) * 80) || 4}px`,
                            background: b.color,
                            borderRadius: '4px 4px 0 0',
                            opacity: 0.8,
                          }}
                        />
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {b.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '13px',
                    color: thisSavings >= 0 ? '#34d399' : '#f87171',
                  }}
                >
                  Net this month: <strong>{fmt(thisSavings)}</strong>
                </div>
              </div>

              <div style={S.card}>
                <h2 style={S.h2}>🔥 Spending Streak</h2>
                <div style={{ textAlign: 'center' as const }}>
                  <div
                    style={{
                      fontSize: '48px',
                      fontWeight: 700,
                      color:
                        streak >= 5
                          ? '#34d399'
                          : streak >= 3
                            ? '#fbbf24'
                            : '#94a3b8',
                    }}
                  >
                    {streak}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    days at or under daily average
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#475569',
                      marginTop: '8px',
                    }}
                  >
                    Daily avg: {fmt(Math.round(dailyAvg))}
                  </div>
                  {streak >= 7 && (
                    <div
                      style={{
                        marginTop: '10px',
                        fontSize: '13px',
                        color: '#34d399',
                        fontWeight: 600,
                      }}
                    >
                      🏅 Amazing discipline!
                    </div>
                  )}
                  {streak >= 3 && streak < 7 && (
                    <div
                      style={{
                        marginTop: '10px',
                        fontSize: '13px',
                        color: '#fbbf24',
                        fontWeight: 600,
                      }}
                    >
                      👍 Keep it going!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
