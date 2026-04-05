// 'use client'
// import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'

// type Tab = 'history' | 'add' | 'export'

// interface FinancialRecord {
//   id: string
//   amount: number
//   type: 'INCOME' | 'EXPENSE'
//   category: string
//   date: string
//   notes?: string
//   deletedAt?: string | null
// }
// interface Transfer {
//   id: string
//   amount: number
//   notes?: string
//   createdAt: string
//   from: { id: string; name: string; email: string }
//   to: { id: string; name: string; email: string }
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
//     background: 'rgba(99,102,241,0.15)',
//     border: '1px solid rgba(99,102,241,0.3)',
//     color: '#818cf8',
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
//   { id: 'add', label: 'Add Record', icon: '➕' },
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
//   if (v === 'INCOME')
//     return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
//   if (v === 'EXPENSE')
//     return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
//   if (v === 'Transfer In')
//     return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
//   if (v === 'Transfer Out')
//     return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
//   return { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
// }

// export default function AnalystDashboard() {
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

//   const [recAmount, setRecAmount] = useState('')
//   const [recType, setRecType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
//   const [recCat, setRecCat] = useState(CATS[0])
//   const [recDate, setRecDate] = useState(new Date().toISOString().split('T')[0])
//   const [recNotes, setRecNotes] = useState('')
//   const [recMsg, setRecMsg] = useState('')
//   const [recErr, setRecErr] = useState('')
//   const [recLoading, setRecLoading] = useState(false)

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

//   useEffect(() => {
//     const uid = localStorage.getItem('userId') || ''
//     setName(localStorage.getItem('name') || 'Analyst')
//     setUserId(uid)
//     fetchBalance()
//     fetchHistory()
//   }, [fetchBalance, fetchHistory])

//   useEffect(() => {
//     if (tab === 'history') fetchHistory()
//   }, [tab, fetchHistory])
//   useEffect(() => {
//     if (tab === 'add') fetchBalance()
//   }, [tab, fetchBalance])

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
//           deletedAt: r.deletedAt,
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
//         fetchHistory()
//       } else setRecErr(j.message)
//     } finally {
//       setRecLoading(false)
//     }
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
//             <span style={S.logoBadge}>ANALYST</span>
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
//             {/* Summary */}
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
//                       <tr
//                         key={row.id}
//                         style={{ opacity: row.deletedAt ? 0.5 : 1 }}
//                       >
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
//             <div
//               style={{
//                 marginTop: '20px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '16px',
//               }}
//             >
//               <button style={S.btn} onClick={addRecord} disabled={recLoading}>
//                 {recLoading ? 'Saving...' : '➕ Add Record'}
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

type Tab = 'dashboard' | 'records' | 'analytics' | 'audit' | 'export'
const NAV = [
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: '📊' },
  { id: 'records' as Tab, label: 'Records', icon: '📋' },
  { id: 'analytics' as Tab, label: 'Analytics', icon: '📉' },
  { id: 'audit' as Tab, label: 'Audit Log', icon: '🔍' },
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
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#818cf8',
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
}

function bc(v: string): React.CSSProperties {
  if (['INCOME', 'RESTORE'].includes(v))
    return { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
  if (['EXPENSE', 'SOFT_DELETE', 'DELETE_USER'].includes(v))
    return { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
  if (['ANALYST', 'UPDATE', 'UPDATE_USER', 'CREATE'].includes(v))
    return { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }
  if (['Transfer Out', 'TRANSFER'].includes(v))
    return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
  return { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
}
function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

export default function AnalystDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [name, setName] = useState('')
  const [balance, setBalance] = useState(0)
  const [userId, setUserId] = useState('')
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])

  // records filters
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [filterMinAmt, setFilterMinAmt] = useState('')
  const [filterMaxAmt, setFilterMaxAmt] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // analytics: compare two periods
  const [cmpA, setCmpA] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
  })
  const [cmpB, setCmpB] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [trendPeriod, setTrendPeriod] = useState<'monthly' | 'weekly'>(
    'monthly',
  )

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

  const fetchAudit = useCallback(async () => {
    const r = await fetch('/api/audit', { headers: hdrs() })
    const j = await r.json()
    if (j.success) setAuditLogs(j.data)
  }, [])

  useEffect(() => {
    setName(localStorage.getItem('name') || 'Analyst')
    fetchMe()
  }, [fetchMe])
  useEffect(() => {
    fetchData()
  }, [fetchData])
  useEffect(() => {
    if (tab === 'audit') fetchAudit()
  }, [tab, fetchAudit])

  // All rows unified
  const allRows = useMemo(() => {
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
    if (filterMinAmt)
      result = result.filter((r) => r.amount >= parseFloat(filterMinAmt))
    if (filterMaxAmt)
      result = result.filter((r) => r.amount <= parseFloat(filterMaxAmt))
    return result.sort((a, b) =>
      sortBy === 'amount'
        ? sortDir === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount
        : sortDir === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }, [
    records,
    transfers,
    userId,
    search,
    filterType,
    filterMinAmt,
    filterMaxAmt,
    sortBy,
    sortDir,
  ])

  const paginated = useMemo(
    () => allRows.slice((page - 1) * pageSize, page * pageSize),
    [allRows, page, pageSize],
  )
  const totalPages = Math.ceil(allRows.length / pageSize)

  // Dashboard stats
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

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months: { label: string; income: number; expense: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
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
      months.push({
        label,
        income: mRows
          .filter((r) => r.type === 'INCOME')
          .reduce((s, r) => s + r.amount, 0),
        expense: mRows
          .filter((r) => r.type === 'EXPENSE')
          .reduce((s, r) => s + r.amount, 0),
      })
    }
    return months
  }, [allRows])

  // Weekly trend (last 8 weeks)
  const weeklyTrend = useMemo(() => {
    const weeks: { label: string; income: number; expense: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now)
      end.setDate(now.getDate() - i * 7)
      const start = new Date(end)
      start.setDate(end.getDate() - 6)
      const label = `W${8 - i}`
      const wRows = allRows.filter((r) => {
        const d = new Date(r.date)
        return d >= start && d <= end
      })
      weeks.push({
        label,
        income: wRows
          .filter((r) => r.type === 'INCOME')
          .reduce((s, r) => s + r.amount, 0),
        expense: wRows
          .filter((r) => r.type === 'EXPENSE')
          .reduce((s, r) => s + r.amount, 0),
      })
    }
    return weeks
  }, [allRows])

  const trendData = trendPeriod === 'monthly' ? monthlyTrend : weeklyTrend
  const maxTrend = Math.max(
    ...trendData.flatMap((t) => [t.income, t.expense]),
    1,
  )

  // Monthly savings report
  const savingsReport = useMemo(
    () => monthlyTrend.map((m) => ({ ...m, savings: m.income - m.expense })),
    [monthlyTrend],
  )
  const bestMonth = savingsReport.reduce(
    (a, b) => (b.savings > a.savings ? b : a),
    savingsReport[0],
  )
  const worstMonth = savingsReport.reduce(
    (a, b) => (b.savings < a.savings ? b : a),
    savingsReport[0],
  )

  // Recurring expense detector
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
      .filter(([, months]) => months.size >= 3)
      .map(([cat, months]) => ({ cat, months: months.size }))
      .sort((a, b) => b.months - a.months)
  }, [records])

  // Period comparison
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

  // Category trend over 6 months
  const catTrendData = useMemo(() => {
    const topCats = Object.entries(
      records
        .filter((r) => !r.deletedAt && r.type === 'EXPENSE')
        .reduce(
          (m, r) => {
            m[r.category] = (m[r.category] || 0) + r.amount
            return m
          },
          {} as Record<string, number>,
        ),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map((e) => e[0])
    return monthlyTrend.map((m) => {
      const entry: Record<string, number | string> = { label: m.label }
      topCats.forEach((cat) => {
        const mRows = records.filter(
          (r) =>
            !r.deletedAt &&
            r.type === 'EXPENSE' &&
            r.category === cat &&
            new Date(r.date).toLocaleDateString('en-IN', {
              month: 'short',
              year: '2-digit',
            }) === m.label,
        )
        entry[cat] = mRows.reduce((s, r) => s + r.amount, 0)
      })
      return { ...entry, _cats: topCats }
    })
  }, [records, monthlyTrend])
  const topCats4 = (catTrendData[0]?._cats as string[]) ?? []
  const catColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

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
    setExpMsg(`Exported as ${expFormat.toUpperCase()} successfully.`)
  }

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
            <span style={S.logoBadge}>ANALYST</span>
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
            {'₹' + balance.toLocaleString('en-IN')}
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
                  label: 'Net Savings',
                  value: fmt(thisIncome - thisExpense),
                  color: thisIncome - thisExpense >= 0 ? '#34d399' : '#f87171',
                  icon: '💎',
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

            {/* Trend chart */}
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
              <div style={{ overflowX: 'auto' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    minWidth: `${trendData.length * 80}px`,
                    alignItems: 'flex-end',
                    height: '180px',
                    paddingBottom: '24px',
                  }}
                >
                  {trendData.map((t) => {
                    const incH = Math.round((t.income / maxTrend) * 140)
                    const expH = Math.round((t.expense / maxTrend) * 140)
                    return (
                      <div
                        key={t.label}
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
                            title={fmt(t.income)}
                            style={{
                              width: '20px',
                              height: `${incH || 4}px`,
                              background: 'rgba(52,211,153,0.7)',
                              borderRadius: '4px 4px 0 0',
                            }}
                          />
                          <div
                            title={fmt(t.expense)}
                            style={{
                              width: '20px',
                              height: `${expH || 4}px`,
                              background: 'rgba(248,113,113,0.7)',
                              borderRadius: '4px 4px 0 0',
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#64748b',
                            textAlign: 'center' as const,
                          }}
                        >
                          {t.label}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#34d399' }}>
                    ■ Income
                  </span>
                  <span style={{ fontSize: '12px', color: '#f87171' }}>
                    ■ Expense
                  </span>
                </div>
              </div>
            </div>

            {/* Recurring expenses + best/worst month */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
              }}
            >
              <div style={S.card}>
                <h2 style={S.h2}>🔁 Recurring Expenses Detected</h2>
                {recurringExpenses.length === 0 ? (
                  <div style={{ color: '#475569' }}>
                    No recurring patterns detected yet.
                  </div>
                ) : (
                  recurringExpenses.map((r) => (
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
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#f1f5f9',
                        }}
                      >
                        {r.cat}
                      </div>
                      <span
                        style={{
                          fontSize: '12px',
                          background: 'rgba(99,102,241,0.15)',
                          color: '#818cf8',
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
                <h2 style={S.h2}>📅 Best & Worst Months</h2>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: '10px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        marginBottom: '4px',
                      }}
                    >
                      🏆 Best Month
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#34d399',
                      }}
                    >
                      {bestMonth?.label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                      Saved {fmt(bestMonth?.savings ?? 0)}
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: '10px',
                      padding: '14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#64748b',
                        marginBottom: '4px',
                      }}
                    >
                      📉 Worst Month
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#f87171',
                      }}
                    >
                      {worstMonth?.label}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                      Net {fmt(worstMonth?.savings ?? 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── RECORDS ── */}
        {tab === 'records' && (
          <div style={S.card}>
            <h2 style={S.h2}>Records</h2>
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
              <div style={{ flex: 1, minWidth: '110px' }}>
                <label style={S.label}>Min ₹</label>
                <input
                  style={S.input}
                  type="number"
                  value={filterMinAmt}
                  onChange={(e) => setFilterMinAmt(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div style={{ flex: 1, minWidth: '110px' }}>
                <label style={S.label}>Max ₹</label>
                <input
                  style={S.input}
                  type="number"
                  value={filterMaxAmt}
                  onChange={(e) => setFilterMaxAmt(e.target.value)}
                  placeholder="∞"
                />
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
              <div style={{ flex: 1, minWidth: '100px' }}>
                <label style={S.label}>Sort</label>
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
                  <option value="desc">↓ High</option>
                  <option value="asc">↑ Low</option>
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
                    setFilterMinAmt('')
                    setFilterMaxAmt('')
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
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#475569' }}>
                {allRows.length} total · Page {page}/{totalPages || 1}
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <label style={{ ...S.label, marginBottom: 0 }}>Per page:</label>
                <select
                  style={{ ...S.input, width: '70px', padding: '4px 8px' }}
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value))
                    setPage(1)
                  }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
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
                          ? 'rgba(245,158,11,0.04)'
                          : 'transparent',
                      }}
                    >
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
                        {'₹' + row.amount.toLocaleString('en-IN')}
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
                            background:
                              row.source === 'Transfer'
                                ? 'rgba(245,158,11,0.15)'
                                : 'rgba(99,102,241,0.15)',
                            color:
                              row.source === 'Transfer' ? '#fbbf24' : '#818cf8',
                          }}
                        >
                          {row.source === 'Transfer' ? '💸' : '📋'} {row.source}
                        </span>
                      </td>
                      <td style={S.td}>
                        {row.anomaly && (
                          <span
                            title="Unusually high for this category"
                            style={{ fontSize: '16px' }}
                          >
                            ⚠️
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td
                        style={{
                          ...S.td,
                          textAlign: 'center',
                          color: '#64748b',
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
            {/* Pagination */}
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
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = Math.max(
                    1,
                    Math.min(page - 2 + i, totalPages - 4 + i),
                  )
                  return (
                    <button
                      key={p}
                      style={{
                        ...S.btnOutline,
                        ...(p === page
                          ? {
                              background: 'rgba(99,102,241,0.3)',
                              color: '#f1f5f9',
                            }
                          : {}),
                      }}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  )
                })}
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

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <>
            {/* Period comparison */}
            <div style={S.card}>
              <h2 style={S.h2}>📅 Period Comparison</h2>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '20px',
                  flexWrap: 'wrap' as const,
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
                              color: '#f1f5f9',
                            }}
                          >
                            {fmt(aVal)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' as const }}>
                          <div style={{ fontSize: '10px', color: '#475569' }}>
                            {cmpB}
                          </div>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              color: '#f1f5f9',
                            }}
                          >
                            {fmt(bVal)}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: isGood ? '#34d399' : '#f87171',
                          fontWeight: 600,
                        }}
                      >
                        {diff >= 0 ? '▲' : '▼'} {fmt(Math.abs(diff))}{' '}
                        {aVal > 0
                          ? `(${Math.abs(Math.round((diff / aVal) * 100))}%)`
                          : ''}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category trend 6 months */}
            <div style={S.card}>
              <h2 style={S.h2}>📈 Category Trend — Last 6 Months</h2>
              {topCats4.length === 0 ? (
                <div style={{ color: '#475569' }}>Not enough data.</div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '12px',
                      flexWrap: 'wrap' as const,
                    }}
                  >
                    {topCats4.map((cat, i) => (
                      <span
                        key={cat}
                        style={{ fontSize: '12px', color: catColors[i] }}
                      >
                        ■ {cat}
                      </span>
                    ))}
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        minWidth: `${catTrendData.length * 80}px`,
                        alignItems: 'flex-end',
                        height: '160px',
                        paddingBottom: '20px',
                      }}
                    >
                      {catTrendData.map((m, mi) => {
                        const maxCat = Math.max(
                          ...catTrendData.flatMap((x) =>
                            topCats4.map((c) => (x[c] as number) || 0),
                          ),
                          1,
                        )
                        return (
                          <div
                            key={mi}
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: '3px',
                                alignItems: 'flex-end',
                              }}
                            >
                              {topCats4.map((cat, ci) => {
                                const val = (m[cat] as number) || 0
                                const h = Math.round((val / maxCat) * 120)
                                return (
                                  <div
                                    key={cat}
                                    title={`${cat}: ${fmt(val)}`}
                                    style={{
                                      width: '14px',
                                      height: `${h || 3}px`,
                                      background: catColors[ci],
                                      borderRadius: '3px 3px 0 0',
                                      opacity: 0.8,
                                    }}
                                  />
                                )
                              })}
                            </div>
                            <div
                              style={{
                                fontSize: '9px',
                                color: '#475569',
                                textAlign: 'center' as const,
                              }}
                            >
                              {m.label as string}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Monthly savings report */}
            <div style={S.card}>
              <h2 style={S.h2}>💰 Monthly Net Savings Report</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
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
                        <td
                          style={{ ...S.td, fontWeight: 600, color: '#f1f5f9' }}
                        >
                          {m.label}
                        </td>
                        <td
                          style={{ ...S.td, color: '#34d399', fontWeight: 600 }}
                        >
                          {fmt(m.income)}
                        </td>
                        <td
                          style={{ ...S.td, color: '#f87171', fontWeight: 600 }}
                        >
                          {fmt(m.expense)}
                        </td>
                        <td
                          style={{
                            ...S.td,
                            fontWeight: 700,
                            color: m.savings >= 0 ? '#34d399' : '#f87171',
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
                                    color: '#34d399',
                                  }
                                : m.label === worstMonth?.label
                                  ? {
                                      background: 'rgba(239,68,68,0.15)',
                                      color: '#f87171',
                                    }
                                  : {
                                      background: 'rgba(148,163,184,0.1)',
                                      color: '#94a3b8',
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
            </div>
          </>
        )}

        {/* ── AUDIT (read-only) ── */}
        {tab === 'audit' && (
          <div style={S.card}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ ...S.h2, marginBottom: 0 }}>
                Audit Log (Read Only)
              </h2>
              <button style={S.btnOutline} onClick={fetchAudit}>
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
              <div
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: '#34d399',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  marginTop: '16px',
                }}
              >
                {expMsg}
              </div>
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
