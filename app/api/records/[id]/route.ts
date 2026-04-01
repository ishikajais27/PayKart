import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import {
  getRecordById,
  updateRecord,
  deleteRecord,
} from '@/services/record.service'
import { recordSchema } from '@/validators/record.validator'
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

    const denied = authorize(user.role, ['VIEWER', 'ANALYST', 'ADMIN'])
    if (denied) return denied

    const { id } = await params
    const record = await getRecordById(id, user.id, user.role)
    return success(record)
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

    const denied = authorize(user.role, ['ANALYST', 'ADMIN'])
    if (denied) return denied

    const body = await req.json()
    const parsed = recordSchema.partial().safeParse(body)
    if (!parsed.success) return error(parsed.error.errors[0].message, 400)

    const { id } = await params
    const updated = await updateRecord(id, user.id, user.role, parsed.data)
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
    await deleteRecord(id, user.id, user.role)
    return success({ message: 'Record deleted' })
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
