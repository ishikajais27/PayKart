import { error } from '@/lib/response'

export function authorize(userRole: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(userRole)) {
    return error('Forbidden: insufficient permissions', 403)
  }
  return null
}
