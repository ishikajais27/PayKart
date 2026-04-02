// 'use client'
// import { useState, useEffect, useCallback } from 'react'
// import { useRouter } from 'next/navigation'

// type Tab = 'records' | 'transfers'

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

// type StyleMap = { [key: string]: React.CSSProperties }

// const S: StyleMap = {
//   page: {
//     minHeight: '100vh',
//     background: '#0a0f1e',
//     color: '#e2e8f0',
//     fontFamily: "'DM Sans', sans-serif",
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
//     background: 'rgba(148,163,184,0.15)',
//     border: '1px solid rgba(148,163,184,0.3)',
//     color: '#94a3b8',
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
//     verticalAlign: 'top',
//   },
//   badge: {
//     display: 'inline-block',
//     padding: '2px 8px',
//     borderRadius: '4px',
//     fontSize: '11px',
//     fontWeight: 600,
//     letterSpacing: '0.04em',
//   },
//   infoBox: {
//     background: 'rgba(99,102,241,0.08)',
//     border: '1px solid rgba(99,102,241,0.2)',
//     borderRadius: '10px',
//     padding: '12px 16px',
//     fontSize: '13px',
//     color: '#818cf8',
//     marginBottom: '20px',
//   },
// }

// export default function ViewerDashboard() {
//   const router = useRouter()
//   const [tab, setTab] = useState<Tab>('records')
//   const [name, setName] = useState('')
//   const [userId, setUserId] = useState('')
//   const [balance, setBalance] = useState(0)
//   const [records, setRecords] = useState<FinancialRecord[]>([])
//   const [transfers, setTransfers] = useState<Transfer[]>([])

//   const getToken = () => localStorage.getItem('token') || ''
//   const hdrs = (): { [key: string]: string } => ({
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${getToken()}`,
//   })

//   const fetchBalance = useCallback(async () => {
//     const res = await fetch('/api/auth/me', { headers: hdrs() })
//     const json = await res.json()
//     if (json.success) setBalance(json.data.balance ?? 0)
//   }, [])

//   const fetchRecords = useCallback(async () => {
//     const res = await fetch('/api/records', { headers: hdrs() })
//     const json = await res.json()
//     if (json.success) setRecords(json.data)
//   }, [])

//   const fetchTransfers = useCallback(async () => {
//     const res = await fetch('/api/transfers', { headers: hdrs() })
//     const json = await res.json()
//     if (json.success) setTransfers(json.data)
//   }, [])

//   useEffect(() => {
//     setName(localStorage.getItem('name') || '')
//     setUserId(localStorage.getItem('userId') || '')
//     fetchBalance()
//   }, [fetchBalance])

//   useEffect(() => {
//     if (tab === 'records') fetchRecords()
//   }, [tab, fetchRecords])
//   useEffect(() => {
//     if (tab === 'transfers') fetchTransfers()
//   }, [tab, fetchTransfers])

//   function logout() {
//     localStorage.clear()
//     router.push('/login')
//   }

//   const typeColor = (t: string): React.CSSProperties =>
//     t === 'INCOME'
//       ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
//       : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }

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
//         {(['records', 'transfers'] as Tab[]).map((id) => (
//           <button
//             key={id}
//             style={{ ...S.navBtn, ...(tab === id ? S.navBtnActive : {}) }}
//             onClick={() => setTab(id)}
//           >
//             <span>{id === 'records' ? '📋' : '💸'}</span>{' '}
//             {id.charAt(0).toUpperCase() + id.slice(1)}
//           </button>
//         ))}
//         <div style={{ flex: 1 }} />
//         <button style={{ ...S.navBtn, color: '#f87171' }} onClick={logout}>
//           🚪 Logout
//         </button>
//       </div>

//       <div style={{ marginLeft: '220px', padding: '32px' }}>
//         {tab === 'records' && (
//           <div style={S.card}>
//             <h2 style={S.h2}>Your Records</h2>
//             <div style={S.infoBox}>
//               👁️ You have view-only access. Contact an Admin or Analyst to add
//               records.
//             </div>
//             <div style={{ overflowX: 'auto' }}>
//               <table style={S.table}>
//                 <thead>
//                   <tr>
//                     {['Category', 'Type', 'Amount', 'Date', 'Notes'].map(
//                       (h) => (
//                         <th key={h} style={S.th}>
//                           {h}
//                         </th>
//                       ),
//                     )}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {records.map((r) => (
//                     <tr key={r.id}>
//                       <td style={S.td}>{r.category}</td>
//                       <td style={S.td}>
//                         <span style={{ ...S.badge, ...typeColor(r.type) }}>
//                           {r.type}
//                         </span>
//                       </td>
//                       <td style={S.td}>₹{r.amount.toLocaleString('en-IN')}</td>
//                       <td style={S.td}>
//                         {new Date(r.date).toLocaleDateString()}
//                       </td>
//                       <td style={S.td}>{r.notes || '—'}</td>
//                     </tr>
//                   ))}
//                   {records.length === 0 && (
//                     <tr>
//                       <td
//                         style={{
//                           ...S.td,
//                           textAlign: 'center',
//                           color: '#64748b',
//                         }}
//                         colSpan={5}
//                       >
//                         No records found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {tab === 'transfers' && (
//           <div style={S.card}>
//             <h2 style={S.h2}>Your Transfer History</h2>
//             <div style={S.infoBox}>
//               💡 Viewers can see transfers involving their account but cannot
//               send money.
//             </div>
//             <div style={{ overflowX: 'auto' }}>
//               <table style={S.table}>
//                 <thead>
//                   <tr>
//                     {[
//                       'Direction',
//                       'Other Party',
//                       'Amount',
//                       'Notes',
//                       'Date',
//                     ].map((h) => (
//                       <th key={h} style={S.th}>
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {transfers.map((t) => {
//                     const isSender = t.from.id === userId
//                     return (
//                       <tr key={t.id}>
//                         <td style={S.td}>
//                           <span
//                             style={{
//                               ...S.badge,
//                               ...(isSender
//                                 ? {
//                                     background: 'rgba(239,68,68,0.15)',
//                                     color: '#f87171',
//                                   }
//                                 : {
//                                     background: 'rgba(16,185,129,0.15)',
//                                     color: '#34d399',
//                                   }),
//                             }}
//                           >
//                             {isSender ? '↑ Sent' : '↓ Received'}
//                           </span>
//                         </td>
//                         <td style={S.td}>
//                           {isSender ? t.to.name : t.from.name}
//                           <br />
//                           <span style={{ color: '#64748b', fontSize: '12px' }}>
//                             {isSender ? t.to.email : t.from.email}
//                           </span>
//                         </td>
//                         <td
//                           style={{
//                             ...S.td,
//                             color: isSender ? '#f87171' : '#34d399',
//                             fontWeight: 600,
//                           }}
//                         >
//                           {isSender ? '-' : '+'}₹
//                           {t.amount.toLocaleString('en-IN')}
//                         </td>
//                         <td style={S.td}>{t.notes || '—'}</td>
//                         <td style={S.td}>
//                           {new Date(t.createdAt).toLocaleString()}
//                         </td>
//                       </tr>
//                     )
//                   })}
//                   {transfers.length === 0 && (
//                     <tr>
//                       <td
//                         style={{
//                           ...S.td,
//                           textAlign: 'center',
//                           color: '#64748b',
//                         }}
//                         colSpan={5}
//                       >
//                         No transfers found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'records' | 'transfers'

interface FinancialRecord {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  category: string
  date: string
  notes?: string
}

interface Transfer {
  id: string
  amount: number
  notes?: string
  createdAt: string
  from: { id: string; name: string; email: string }
  to: { id: string; name: string; email: string }
}

type StyleMap = { [key: string]: React.CSSProperties }

const S: StyleMap = {
  page: {
    minHeight: '100vh',
    background: '#0a0f1e',
    color: '#e2e8f0',
    fontFamily: "'DM Sans', sans-serif",
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
    background: 'rgba(148,163,184,0.15)',
    border: '1px solid rgba(148,163,184,0.3)',
    color: '#94a3b8',
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
  },
  navBtnActive: {
    color: '#f1f5f9',
    background: 'rgba(99,102,241,0.12)',
    borderLeft: '3px solid #6366f1',
  },
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
    verticalAlign: 'top',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  infoBox: {
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    color: '#818cf8',
    marginBottom: '20px',
  },
}

export default function ViewerDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('records')
  const [name, setName] = useState('')
  const [userId, setUserId] = useState('')
  const [balance, setBalance] = useState(0)
  const [records, setRecords] = useState<FinancialRecord[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])

  const getToken = () => localStorage.getItem('token') || ''
  const hdrs = (): { [key: string]: string } => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  })

  const fetchBalance = useCallback(async () => {
    const res = await fetch('/api/auth/me', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setBalance(json.data.balance ?? 0)
  }, [])

  const fetchRecords = useCallback(async () => {
    const res = await fetch('/api/records', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setRecords(json.data)
  }, [])

  const fetchTransfers = useCallback(async () => {
    const res = await fetch('/api/transfers', { headers: hdrs() })
    const json = await res.json()
    if (json.success) setTransfers(json.data)
  }, [])

  useEffect(() => {
    const storedName = localStorage.getItem('name') || ''
    const storedId = localStorage.getItem('userId') || ''
    setName(storedName)
    setUserId(storedId)
    fetchBalance()
  }, [fetchBalance])

  useEffect(() => {
    if (tab === 'records') fetchRecords()
  }, [tab, fetchRecords])
  useEffect(() => {
    if (tab === 'transfers') fetchTransfers()
  }, [tab, fetchTransfers])

  function logout() {
    localStorage.clear()
    router.push('/login')
  }

  const typeColor = (t: string): React.CSSProperties =>
    t === 'INCOME'
      ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
      : { background: 'rgba(239,68,68,0.15)', color: '#f87171' }

  // Stats for transfer tab
  const totalReceived = transfers
    .filter((t) => t.to.id === userId)
    .reduce((s, t) => s + t.amount, 0)

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
            ₹{balance.toLocaleString('en-IN')}
          </div>
        </div>
        {(['records', 'transfers'] as Tab[]).map((id) => (
          <button
            key={id}
            style={{ ...S.navBtn, ...(tab === id ? S.navBtnActive : {}) }}
            onClick={() => setTab(id)}
          >
            <span>{id === 'records' ? '📋' : '💸'}</span>{' '}
            {id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button style={{ ...S.navBtn, color: '#f87171' }} onClick={logout}>
          🚪 Logout
        </button>
      </div>

      <div style={{ marginLeft: '220px', padding: '32px' }}>
        {tab === 'records' && (
          <div style={S.card}>
            <h2 style={S.h2}>Your Records</h2>
            <div style={S.infoBox}>
              👁️ You have view-only access. Contact an Admin or Analyst to add
              records.
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    {['Category', 'Type', 'Amount', 'Date', 'Notes'].map(
                      (h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td style={S.td}>{r.category}</td>
                      <td style={S.td}>
                        <span style={{ ...S.badge, ...typeColor(r.type) }}>
                          {r.type}
                        </span>
                      </td>
                      <td style={S.td}>₹{r.amount.toLocaleString('en-IN')}</td>
                      <td style={S.td}>
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td style={S.td}>{r.notes || '—'}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td
                        style={{
                          ...S.td,
                          textAlign: 'center',
                          color: '#64748b',
                        }}
                        colSpan={5}
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

        {tab === 'transfers' && (
          <div>
            {/* Stats row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 600,
                    marginBottom: '6px',
                    letterSpacing: '0.06em',
                  }}
                >
                  TOTAL RECEIVED
                </div>
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#34d399',
                  }}
                >
                  ₹{totalReceived.toLocaleString('en-IN')}
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 600,
                    marginBottom: '6px',
                    letterSpacing: '0.06em',
                  }}
                >
                  TRANSACTIONS
                </div>
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: 700,
                    color: '#818cf8',
                  }}
                >
                  {transfers.length}
                </div>
              </div>
            </div>

            <div style={S.card}>
              <h2 style={S.h2}>Transfer History</h2>
              <div style={S.infoBox}>
                💡 Viewers can receive money. To send money, contact your Admin
                to upgrade your role.
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['', 'Party', 'Amount', 'Notes', 'Date'].map((h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((t) => {
                      const isSender = t.from.id === userId
                      return (
                        <tr key={t.id}>
                          <td style={S.td}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: isSender
                                  ? 'rgba(239,68,68,0.15)'
                                  : 'rgba(16,185,129,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                              }}
                            >
                              {isSender ? '↑' : '↓'}
                            </div>
                          </td>
                          <td style={S.td}>
                            <div
                              style={{
                                fontWeight: 600,
                                color: '#f1f5f9',
                                fontSize: '14px',
                              }}
                            >
                              {isSender ? t.to.name : t.from.name}
                            </div>
                            <div
                              style={{
                                color: '#64748b',
                                fontSize: '12px',
                                marginTop: '2px',
                              }}
                            >
                              {isSender ? t.to.email : t.from.email}
                            </div>
                            <div
                              style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                                letterSpacing: '0.06em',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: isSender
                                  ? 'rgba(239,68,68,0.15)'
                                  : 'rgba(16,185,129,0.15)',
                                color: isSender ? '#f87171' : '#34d399',
                              }}
                            >
                              {isSender ? 'SENT' : 'RECEIVED'}
                            </div>
                          </td>
                          <td
                            style={{
                              ...S.td,
                              color: isSender ? '#f87171' : '#34d399',
                              fontWeight: 700,
                              fontSize: '16px',
                            }}
                          >
                            {isSender ? '−' : '+'}₹
                            {t.amount.toLocaleString('en-IN')}
                          </td>
                          <td
                            style={{
                              ...S.td,
                              color: '#94a3b8',
                              fontSize: '13px',
                            }}
                          >
                            {t.notes || '—'}
                          </td>
                          <td
                            style={{
                              ...S.td,
                              color: '#64748b',
                              fontSize: '12px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <div>
                              {new Date(t.createdAt).toLocaleDateString(
                                'en-IN',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                },
                              )}
                            </div>
                            <div style={{ marginTop: '2px' }}>
                              {new Date(t.createdAt).toLocaleTimeString(
                                'en-IN',
                                { hour: '2-digit', minute: '2-digit' },
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {transfers.length === 0 && (
                      <tr>
                        <td
                          style={{
                            ...S.td,
                            textAlign: 'center',
                            color: '#64748b',
                            padding: '32px',
                          }}
                          colSpan={5}
                        >
                          <div
                            style={{ fontSize: '32px', marginBottom: '8px' }}
                          >
                            💸
                          </div>
                          <div>No transfers yet</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
