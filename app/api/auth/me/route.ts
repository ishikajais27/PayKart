import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { prisma } from '@/lib/prisma'
import { success, error } from '@/lib/response'
import { TokenPayload } from '@/types'
import { getUserById } from '@/services/user'
export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const payload = auth as TokenPayload

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        balance: true,
      },
    })
    if (!user) throw new Error('User not found')
    return success(user)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      401,
    )
  }
}
