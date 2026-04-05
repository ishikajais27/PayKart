import { prisma } from '@/lib/prisma'
import { logAudit } from '@/services/audit'
import { RecordType } from '@/types'

interface RecordFilters {
  type?: RecordType
  category?: string
  startDate?: string
  endDate?: string
  includeDeleted?: boolean
}

export async function createRecord(
  userId: string,
  data: {
    amount: number
    type: RecordType
    category: string
    date: string
    notes?: string
  },
) {
  const record = await prisma.financialRecord.create({
    data: { ...data, date: new Date(data.date), userId },
  })

  await logAudit({
    userId,
    action: 'CREATE',
    entity: 'FinancialRecord',
    entityId: record.id,
    after: record,
  })

  return record
}

export async function getRecords(
  userId: string,
  role: string,
  filters: RecordFilters,
) {
  const where: Record<string, unknown> = {}

  // Always show only the requesting user's own records
  where.userId = userId

  if (filters.type) where.type = filters.type
  if (filters.category) where.category = filters.category
  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate && { gte: new Date(filters.startDate) }),
      ...(filters.endDate && { lte: new Date(filters.endDate) }),
    }
  }

  if (!filters.includeDeleted) {
    where.deletedAt = null
  }

  return prisma.financialRecord.findMany({
    where,
    orderBy: { date: 'desc' },
  })
}

export async function getRecordById(id: string, userId: string, role: string) {
  const record = await prisma.financialRecord.findUnique({ where: { id } })
  if (!record) throw new Error('Record not found')
  if (record.deletedAt) throw new Error('Record has been deleted')
  if (role !== 'ADMIN' && record.userId !== userId) throw new Error('Forbidden')
  return record
}

export async function updateRecord(
  id: string,
  userId: string,
  role: string,
  data: {
    amount?: number
    type?: RecordType
    category?: string
    date?: string
    notes?: string
  },
) {
  const record = await prisma.financialRecord.findUnique({ where: { id } })
  if (!record) throw new Error('Record not found')
  if (record.deletedAt) throw new Error('Record has been deleted')
  if (role !== 'ADMIN' && record.userId !== userId) throw new Error('Forbidden')

  const updated = await prisma.financialRecord.update({
    where: { id },
    data: { ...data, ...(data.date && { date: new Date(data.date) }) },
  })

  await logAudit({
    userId,
    action: 'UPDATE',
    entity: 'FinancialRecord',
    entityId: id,
    before: record,
    after: updated,
  })

  return updated
}

export async function deleteRecord(id: string, userId: string, role: string) {
  const record = await prisma.financialRecord.findUnique({ where: { id } })
  if (!record) throw new Error('Record not found')
  if (record.deletedAt) throw new Error('Record already deleted')
  if (role !== 'ADMIN' && record.userId !== userId) throw new Error('Forbidden')

  const updated = await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await logAudit({
    userId,
    action: 'SOFT_DELETE',
    entity: 'FinancialRecord',
    entityId: id,
    before: record,
  })

  return updated
}

export async function restoreRecord(id: string, userId: string, role: string) {
  if (role !== 'ADMIN') throw new Error('Only admins can restore records')

  const record = await prisma.financialRecord.findUnique({ where: { id } })
  if (!record) throw new Error('Record not found')
  if (!record.deletedAt) throw new Error('Record is not deleted')

  const restored = await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: null },
  })

  await logAudit({
    userId,
    action: 'RESTORE',
    entity: 'FinancialRecord',
    entityId: id,
    after: restored,
  })

  return restored
}

export async function exportRecords(
  userId: string,
  role: string,
  filters: RecordFilters,
  format: 'csv' | 'json',
) {
  const records = await getRecords(userId, role, filters)

  if (format === 'json') {
    return JSON.stringify(records, null, 2)
  }

  const headers = [
    'id',
    'amount',
    'type',
    'category',
    'date',
    'notes',
    'userId',
    'createdAt',
  ]
  const rows = records.map((r) =>
    headers
      .map((h) => {
        const val = (r as Record<string, unknown>)[h]
        const str = val instanceof Date ? val.toISOString() : String(val ?? '')
        return `"${str.replace(/"/g, '""')}"`
      })
      .join(','),
  )
  return [headers.join(','), ...rows].join('\n')
}
