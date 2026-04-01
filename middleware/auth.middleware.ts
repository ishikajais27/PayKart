import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { errorResponse } from '@/lib/response'

export function authenticate(req: NextRequest) {
  // Support both cookie (httpOnly) and Bearer token header
  const cookie = req.cookies.get('token')?.value
  const header = req.headers.get('authorization')?.replace('Bearer ', '')
  const token = cookie || header

  if (!token) return errorResponse('Unauthorized', 401)

  try {
    return verifyToken(token)
  } catch {
    return errorResponse('Invalid token', 401)
  }
}
