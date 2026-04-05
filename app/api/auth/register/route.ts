import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/validators/auth'
import { registerUser } from '@/services/auth'
import { successResponse, errorResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? 'Invalid input'
      return errorResponse(message, 400)
    }

    const result = await registerUser(
      parsed.data.name,
      parsed.data.email,
      parsed.data.password,
    )

    const res = successResponse(result, 201)
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
