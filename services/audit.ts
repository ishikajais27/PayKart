import { prisma } from '@/lib/prisma'

interface AuditParams {
  userId: string
  action: string
  entity: string
  entityId: string
  before?: object | null
  after?: object | null
}

export async function logAudit(params: AuditParams) {
  try {
    await prisma.auditLog.create({ data: params })
  } catch {
    // Audit logging should never break the main flow
    console.error('Audit log failed:', params)
  }
}

export async function getAuditLogs(filters: {
  entity?: string
  userId?: string
  take?: number
}) {
  return prisma.auditLog.findMany({
    where: {
      ...(filters.entity && { entity: filters.entity }),
      ...(filters.userId && { userId: filters.userId }),
    },
    orderBy: { createdAt: 'desc' },
    take: filters.take ?? 50,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })
}
