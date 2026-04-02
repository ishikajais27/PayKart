import { PrismaClient, Role, RecordType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const categories = {
  EXPENSE: [
    'Food',
    'Travel',
    'Rent',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Utilities',
    'Education',
  ],
  INCOME: ['Salary', 'Freelance', 'Investment', 'Bonus'],
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function seedRecordsForUser(userId: string) {
  const data = []

  for (let month = 5; month >= 0; month--) {
    const salaryDate = new Date()
    salaryDate.setMonth(salaryDate.getMonth() - month)
    salaryDate.setDate(1)
    data.push({
      amount: randomBetween(40000, 80000),
      type: RecordType.INCOME,
      category: 'Salary',
      date: salaryDate,
      notes: `Monthly salary - ${salaryDate.toLocaleString('default', { month: 'long' })}`,
      userId,
    })

    if (month % 2 === 0) {
      const bonusDate = new Date()
      bonusDate.setMonth(bonusDate.getMonth() - month)
      bonusDate.setDate(15)
      data.push({
        amount: randomBetween(5000, 20000),
        type: RecordType.INCOME,
        category: categories.INCOME[randomBetween(1, 3)],
        date: bonusDate,
        notes: 'Additional income',
        userId,
      })
    }

    const expenseCount = randomBetween(8, 12)
    for (let i = 0; i < expenseCount; i++) {
      const expDate = new Date()
      expDate.setMonth(expDate.getMonth() - month)
      expDate.setDate(randomBetween(1, 28))
      const cat =
        categories.EXPENSE[randomBetween(0, categories.EXPENSE.length - 1)]
      data.push({
        amount: randomBetween(200, 8000),
        type: RecordType.EXPENSE,
        category: cat,
        date: expDate,
        notes: `${cat} expense`,
        userId,
      })
    }
  }

  for (const record of data) {
    await prisma.financialRecord.create({ data: record })
  }
}

async function main() {
  const password = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { balance: 500000 }, // ← updates balance if user already exists
    create: {
      name: 'Admin User',
      email: 'admin@test.com',
      password,
      role: Role.ADMIN,
      balance: 500000,
    },
  })

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@test.com' },
    update: { balance: 200000 },
    create: {
      name: 'Analyst User',
      email: 'analyst@test.com',
      password,
      role: Role.ANALYST,
      balance: 200000,
    },
  })

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@test.com' },
    update: { balance: 100000 },
    create: {
      name: 'Viewer User',
      email: 'viewer@test.com',
      password,
      role: Role.VIEWER,
      balance: 100000,
    },
  })

  // Clear old records
  await prisma.financialRecord.deleteMany({
    where: { userId: { in: [admin.id, analyst.id, viewer.id] } },
  })

  await seedRecordsForUser(admin.id)
  await seedRecordsForUser(analyst.id)
  await seedRecordsForUser(viewer.id)

  console.log('✅ Seed complete')
  console.log('─────────────────────────────────')
  console.log('admin@test.com    → password123  (ADMIN)    balance: ₹5,00,000')
  console.log('analyst@test.com  → password123  (ANALYST)  balance: ₹2,00,000')
  console.log('viewer@test.com   → password123  (VIEWER)   balance: ₹1,00,000')
  console.log('─────────────────────────────────')
  console.log('Each user has ~6 months of realistic financial records')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
