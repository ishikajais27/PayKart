'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (!token) {
      router.push('/login')
      return
    }
    if (role === 'ADMIN') router.push('/dashboard/admin')
    else if (role === 'ANALYST') router.push('/dashboard/analyst')
    else router.push('/dashboard/viewer')
  }, [router])
  return null
}
