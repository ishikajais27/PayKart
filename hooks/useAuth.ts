'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'VIEWER' | 'ANALYST' | 'ADMIN'
  isActive: boolean
}

export function useAuth(requiredRole?: 'VIEWER' | 'ANALYST' | 'ADMIN') {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) {
          router.push('/login')
          return
        }
        const u: AuthUser = json.data
        if (requiredRole && u.role !== requiredRole) {
          if (u.role === 'ADMIN') router.push('/dashboard/admin')
          else if (u.role === 'ANALYST') router.push('/dashboard/analyst')
          else router.push('/dashboard/viewer')
          return
        }
        setUser(u)
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [router, requiredRole])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return { user, loading, logout }
}
