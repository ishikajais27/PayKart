import { NextRequest, NextResponse } from 'next/server'
import { acceptInvite } from '@/services/invite.service'
import { errorResponse } from '@/lib/response'
import { z } from 'zod'

const acceptSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = acceptSchema.safeParse(body)
    if (!parsed.success)
      return errorResponse(parsed.error.errors[0].message, 400)

    const result = await acceptInvite(
      parsed.data.token,
      parsed.data.name,
      parsed.data.password,
    )

    const response = NextResponse.json(
      { success: true, data: result },
      { status: 201 },
    )
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (err: unknown) {
    return errorResponse(
      err instanceof Error ? err.message : 'Something went wrong',
      400,
    )
  }
}
