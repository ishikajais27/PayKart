import { ZodSchema } from 'zod'

type ParseSuccess<T> = { data: T; error: null }
type ParseFailure = { data: null; error: string }

export function parseBody<T>(
  schema: ZodSchema<T>,
  body: unknown,
): ParseSuccess<T> | ParseFailure {
  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error?.errors?.[0]?.message ?? 'Invalid input'
    return { data: null, error: message }
  }
  return { data: result.data, error: null }
}
