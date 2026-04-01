import { errorResponse } from '@/lib/response'

export function authorize(userRole: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(userRole)) {
    return errorResponse('Forbidden: insufficient permissions', 403)
  }
  return null
}
