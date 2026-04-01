import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { createRecord, getRecords } from '@/services/record.service'
import { recordSchema } from '@/validators/record.validator'
import { success, error } from '@/lib/response'
import { TokenPayload, RecordType } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload

    const denied = authorize(user.role, ['VIEWER', 'ANALYST', 'ADMIN'])
    if (denied) return denied

    const { searchParams } = new URL(req.url)
    const filters = {
      type: searchParams.get('type') as RecordType | undefined,
      category: searchParams.get('category') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    }

    const records = await getRecords(user.id, user.role, filters)
    return success(records)
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

    const denied = authorize(user.role, ['ANALYST', 'ADMIN'])
    if (denied) return denied

    const body = await req.json()
    const parsed = recordSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.errors[0].message, 400)

    const record = await createRecord(user.id, parsed.data)
    return success(record, 201)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
