import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { getAllUsers } from '@/services/user.service'
import { successResponse, errorResponse } from '@/lib/response'
import { TokenPayload } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload
    const denied = authorize(user.role, ['ADMIN'])
    if (denied) return denied
    const users = await getAllUsers()
    return successResponse(users)
  } catch (err: unknown) {
    return errorResponse(
      err instanceof Error ? err.message : 'Something went wrong',
      500,
    )
  }
}
