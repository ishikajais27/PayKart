import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { getUserById, updateUser } from '@/services/user.service'
import { updateUserSchema } from '@/validators/user.validator'
import { success, error } from '@/lib/response'
import { TokenPayload } from '@/types'

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

    // Only ADMIN can change roles / activate / deactivate
    const denied = authorize(user.role, ['ADMIN'])
    if (denied) return denied

    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.errors[0].message, 400)

    const { id } = await params

    // Prevent admin from deactivating themselves
    if (id === user.id && parsed.data.isActive === false) {
      return error('Cannot deactivate your own account', 400)
    }

    const updated = await updateUser(id, parsed.data)
    return success(updated)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
