// app/api/invites/route.ts
import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { createInvite, listInvites } from '@/services/invite'
import { success, error } from '@/lib/response'
import { TokenPayload } from '@/types'
import { z } from 'zod'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
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
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return error(message, 400)
    }
    const result = await createInvite(
      user.id,
      parsed.data.email,
      parsed.data.role,
    )
    return success(result, 201)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
