// import { NextRequest } from 'next/server'
// import { authenticate } from '@/middleware/auth.middleware'
// import { authorize } from '@/middleware/role.middleware'
// import { getRecentActivity } from '@/services/dashboard'
// import { success, error } from '@/lib/response'
// import { TokenPayload } from '@/types'

// export async function GET(req: NextRequest) {
//   try {
//     const auth = authenticate(req)
//     if (auth instanceof Response) return auth
//     const user = auth as TokenPayload

//     const denied = authorize(user.role, ['ANALYST', 'ADMIN'])
//     if (denied) return denied

//     const data = await getRecentActivity(user.id, user.role)
//     return success(data)
//   } catch (err: unknown) {
//     return error(
//       err instanceof Error ? err.message : 'Something went wrong',
//       500,
//     )
//   }
// }
import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { getRecentActivity } from '@/services/dashboard'
import { success, error } from '@/lib/response'
import { TokenPayload } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload

    // Analyst and Admin only
    const denied = authorize(user.role, ['ANALYST', 'ADMIN'])
    if (denied) return denied

    const data = await getRecentActivity(user.id, user.role)
    return success(data)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      500,
    )
  }
}
