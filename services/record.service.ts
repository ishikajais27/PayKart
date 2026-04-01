import { prisma } from '@/lib/prisma'
import { RecordType } from '@/types'

interface RecordFilters {
  type?: RecordType
  category?: string
  startDate?: string
  endDate?: string
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
  return prisma.financialRecord.create({
    data: { ...data, date: new Date(data.date), userId },
  })
}

export async function getRecords(
  userId: string,
  role: string,
  filters: RecordFilters,
) {
  const where: Record<string, unknown> = {}

  // viewers and analysts only see their own records, admin sees all
  if (role !== 'ADMIN') where.userId = userId
  if (filters.type) where.type = filters.type
  if (filters.category) where.category = filters.category
  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate && { gte: new Date(filters.startDate) }),
      ...(filters.endDate && { lte: new Date(filters.endDate) }),
    }
  }

  return prisma.financialRecord.findMany({
    where,
    orderBy: { date: 'desc' },
  })
}

export async function getRecordById(id: string, userId: string, role: string) {
  const record = await prisma.financialRecord.findUnique({ where: { id } })
  if (!record) throw new Error('Record not found')
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
  if (role !== 'ADMIN' && record.userId !== userId) throw new Error('Forbidden')

  return prisma.financialRecord.update({
    where: { id },
    data: { ...data, ...(data.date && { date: new Date(data.date) }) },
  })
}

export async function deleteRecord(id: string, userId: string, role: string) {
  const record = await prisma.financialRecord.findUnique({ where: { id } })
  if (!record) throw new Error('Record not found')
  if (role !== 'ADMIN' && record.userId !== userId) throw new Error('Forbidden')

  return prisma.financialRecord.delete({ where: { id } })
}
