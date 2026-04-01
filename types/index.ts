export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN'
export type RecordType = 'INCOME' | 'EXPENSE'

export interface TokenPayload {
  id: string
  role: Role
}
