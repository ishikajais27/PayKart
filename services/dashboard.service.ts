import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

export async function getSummary(userId: string, role: string) {
  const cacheKey = `summary:${role === 'ADMIN' ? 'all' : userId}`
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const where = role !== 'ADMIN' ? { userId } : {}

  const records = await prisma.financialRecord.findMany({ where })

  const totalIncome = records
    .filter((r) => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0)

  const totalExpenses = records
    .filter((r) => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0)

  const netBalance = totalIncome - totalExpenses

  const categoryTotals: Record<string, number> = {}
  for (const r of records) {
    categoryTotals[r.category] = (categoryTotals[r.category] || 0) + r.amount
  }

  const result = { totalIncome, totalExpenses, netBalance, categoryTotals }
  await redis.set(cacheKey, JSON.stringify(result), 'EX', 60)
  return result
}

export async function getTrends(
  userId: string,
  role: string,
  period: 'weekly' | 'monthly',
) {
  const where = role !== 'ADMIN' ? { userId } : {}
  const records = await prisma.financialRecord.findMany({
    where,
    orderBy: { date: 'asc' },
  })

  const trends: Record<string, { income: number; expense: number }> = {}

  for (const r of records) {
    const date = new Date(r.date)
    const key =
      period === 'weekly'
        ? `${date.getFullYear()}-W${getWeekNumber(date)}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!trends[key]) trends[key] = { income: 0, expense: 0 }
    if (r.type === 'INCOME') trends[key].income += r.amount
    else trends[key].expense += r.amount
  }

  return trends
}

export async function getRecentActivity(userId: string, role: string) {
  const where = role !== 'ADMIN' ? { userId } : {}
  return prisma.financialRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

function getWeekNumber(date: Date) {
  const start = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.ceil(diff / oneWeek)
}
