import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { getUserById, updateUser, deleteUser } from '@/services/user'
import { logAudit } from '@/services/audit'
import { success, error } from '@/lib/response'
import { TokenPayload } from '@/types'
import { z } from 'zod'

const updateSchema = z.object({
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload
    const denied = authorize(user.role, ['ADMIN'])
    if (denied) return denied
    const { id } = await params
    const found = await getUserById(id)
    return success(found)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      404,
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload
    const denied = authorize(user.role, ['ADMIN'])
    if (denied) return denied

    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.errors[0].message, 400)

    const { id } = await params
    if (id === user.id && parsed.data.isActive === false)
      return error('Cannot deactivate your own account', 400)

    const before = await getUserById(id)
    const updated = await updateUser(id, parsed.data)
    await logAudit({
      userId: user.id,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: id,
      before,
      after: updated,
    })
    return success(updated)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload
    const denied = authorize(user.role, ['ADMIN'])
    if (denied) return denied

    const { id } = await params
    if (id === user.id) return error('Cannot delete your own account', 400)

    await logAudit({
      userId: user.id,
      action: 'DELETE_USER',
      entity: 'User',
      entityId: id,
      before: await getUserById(id),
    })
    await deleteUser(id)
    return success({ message: 'User deleted' })
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
