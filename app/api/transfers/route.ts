import { NextRequest } from 'next/server'
import { authenticate } from '@/middleware/auth.middleware'
import { authorize } from '@/middleware/role.middleware'
import { sendMoney, getTransferHistory } from '@/services/transfer.service'
import { success, error } from '@/lib/response'
import { TokenPayload } from '@/types'
import { z } from 'zod'

const transferSchema = z.object({
  toEmail: z.string().email('Invalid receiver email'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const auth = authenticate(req)
    if (auth instanceof Response) return auth
    const user = auth as TokenPayload

    const denied = authorize(user.role, ['VIEWER', 'ANALYST', 'ADMIN'])
    if (denied) return denied

    const history = await getTransferHistory(user.id, user.role)
    return success(history)
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
    const parsed = transferSchema.safeParse(body)
    if (!parsed.success) return error(parsed.error.errors[0].message, 400)

    const result = await sendMoney(
      user.id,
      parsed.data.toEmail,
      parsed.data.amount,
      parsed.data.notes,
    )
    return success(result, 200)
  } catch (err: unknown) {
    return error(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
