import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { error } from '@/lib/response'

export function authenticate(req: NextRequest) {
  // Try cookie first, then Authorization header
  const cookieToken = req.cookies.get('token')?.value
  const headerToken = req.headers.get('authorization')?.replace('Bearer ', '')
  const token = cookieToken || headerToken

  if (!token) return error('Unauthorized', 401)

  try {
    const payload = verifyToken(token)
    return payload
  } catch {
    return error('Invalid or expired token', 401)
  }
}
