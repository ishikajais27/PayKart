import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/validators/auth'
import { loginUser } from '@/services/auth'
import { errorResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success)
      return errorResponse(parsed.error.errors[0].message, 400)

    const result = await loginUser(parsed.data.email, parsed.data.password)

    const response = NextResponse.json(
      { success: true, data: result },
      { status: 200 },
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
