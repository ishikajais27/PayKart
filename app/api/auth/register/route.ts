import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/validators/auth'
import { registerUser } from '@/services/auth'
import { errorResponse } from '@/lib/response'
import { parseBody } from '@/lib/parse'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error: parseError } = parseBody(registerSchema, body)
    if (parseError) return errorResponse(parseError, 400)

    const result = await registerUser(data.name, data.email, data.password)

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
