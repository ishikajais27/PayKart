import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { getTrends } from '@/services/dashboard.service'
import { success, error } from '@/lib/response'
import { TokenPayload } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload

    const denied = authorize(user.role, ['ANALYST', 'ADMIN'])
    if (denied) return denied

    const period =
      new URL(req.url).searchParams.get('period') === 'weekly'
        ? 'weekly'
        : 'monthly'
    const data = await getTrends(user.id, user.role, period)
    return success(data)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      500,
    )
  }
}
