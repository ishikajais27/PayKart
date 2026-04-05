import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { getAuditLogs } from '@/services/audit'
import { success, error } from '@/lib/response'
import { TokenPayload } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload

    const denied = authorize(user.role, ['ADMIN'])
    if (denied) return denied

    const { searchParams } = new URL(req.url)
    const entity = searchParams.get('entity') || undefined
    const userId = searchParams.get('userId') || undefined
    const take = parseInt(searchParams.get('take') || '50')

    const logs = await getAuditLogs({ entity, userId, take })
    return success(logs)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      500,
    )
  }
}
