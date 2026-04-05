import { ZodSchema, ZodError } from 'zod'

export function parseBody<T>(
  schema: ZodSchema<T>,
  body: unknown,
): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error?.errors?.[0]?.message ?? 'Invalid input'
    return { data: null, error: message }
  }
  return { data: result.data, error: null }
}
