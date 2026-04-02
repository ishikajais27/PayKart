import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { createInvite, listInvites } from '@/services/invite.service'
import { success, error } from '@/lib/response'
import { TokenPayload, Role } from '@/types'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']),
})

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload

    const denied = authorize(user.role, ['ADMIN'])
    if (denied) return denied

    const invites = await listInvites(user.id)
    return success(invites)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      500,
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload

    const denied = authorize(user.role, ['ADMIN'])
    if (denied) return denied

    const body = await req.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.errors[0].message, 400)

    const invite = await createInvite(
      user.id,
      parsed.data.email,
      parsed.data.role as Role,
    )
    return success(invite, 201)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
