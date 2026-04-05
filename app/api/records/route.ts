import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { createRecord, getRecords, exportRecords } from '@/services/record'
import { recordSchema } from '@/validators/record'
import { success, error } from '@/lib/response'
import { parseBody } from '@/lib/parse'
import { TokenPayload, RecordType } from '@/types'

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload

    const denied = authorize(user.role, ['VIEWER', 'ANALYST', 'ADMIN'])
    if (denied) return denied

    const { searchParams } = new URL(req.url)
    const exportFormat = searchParams.get('export') as 'csv' | 'json' | null
    const filters = {
      type: (searchParams.get('type') as RecordType) || undefined,
      category: searchParams.get('category') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      includeDeleted: searchParams.get('includeDeleted') === 'true',
    }

    if (exportFormat === 'csv' || exportFormat === 'json') {
      const data = await exportRecords(
        user.id,
        user.role,
        filters,
        exportFormat,
      )
      const contentType =
        exportFormat === 'csv' ? 'text/csv' : 'application/json'
      return new Response(data, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="records.${exportFormat}"`,
        },
      })
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
    const { data, error: parseError } = parseBody(recordSchema, body)
    if (parseError) return error(parseError, 400)

    const record = await createRecord(user.id, data)
    return success(record, 201)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
