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

function buildRecords(userId: string) {
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
      notes: `Monthly salary`,
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

    for (let i = 0; i < randomBetween(8, 12); i++) {
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
  return data
}

async function main() {
  const password = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { balance: 500000 },
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

  await prisma.financialRecord.deleteMany({
    where: { userId: { in: [admin.id, analyst.id, viewer.id] } },
  })
  await prisma.financialRecord.createMany({ data: buildRecords(admin.id) })
  await prisma.financialRecord.createMany({ data: buildRecords(analyst.id) })
  await prisma.financialRecord.createMany({ data: buildRecords(viewer.id) })

  await prisma.transfer.deleteMany({
    where: {
      OR: [
        { fromId: { in: [admin.id, analyst.id, viewer.id] } },
        { toId: { in: [admin.id, analyst.id, viewer.id] } },
      ],
    },
  })

  const transfers = [
    {
      fromId: admin.id,
      toId: analyst.id,
      amount: 15000,
      notes: 'Project bonus',
      daysAgo: 2,
    },
    {
      fromId: admin.id,
      toId: analyst.id,
      amount: 5000,
      notes: 'Travel reimbursement',
      daysAgo: 10,
    },
    {
      fromId: admin.id,
      toId: analyst.id,
      amount: 20000,
      notes: 'Q3 incentive',
      daysAgo: 35,
    },
    {
      fromId: admin.id,
      toId: viewer.id,
      amount: 8000,
      notes: 'Freelance payment',
      daysAgo: 5,
    },
    {
      fromId: admin.id,
      toId: viewer.id,
      amount: 3500,
      notes: 'Expense reimbursement',
      daysAgo: 20,
    },
    {
      fromId: analyst.id,
      toId: admin.id,
      amount: 12000,
      notes: 'Loan repayment',
      daysAgo: 7,
    },
    {
      fromId: analyst.id,
      toId: admin.id,
      amount: 2500,
      notes: 'Shared bill',
      daysAgo: 15,
    },
    {
      fromId: analyst.id,
      toId: viewer.id,
      amount: 4000,
      notes: 'Team lunch',
      daysAgo: 3,
    },
    {
      fromId: analyst.id,
      toId: viewer.id,
      amount: 7500,
      notes: 'Referral bonus',
      daysAgo: 25,
    },
    {
      fromId: viewer.id,
      toId: admin.id,
      amount: 1000,
      notes: 'Office supplies',
      daysAgo: 12,
    },
    {
      fromId: viewer.id,
      toId: analyst.id,
      amount: 2000,
      notes: 'Split bill',
      daysAgo: 8,
    },
    {
      fromId: admin.id,
      toId: analyst.id,
      amount: 18000,
      notes: 'Monthly stipend',
      daysAgo: 60,
    },
    {
      fromId: admin.id,
      toId: viewer.id,
      amount: 10000,
      notes: 'Project payment',
      daysAgo: 55,
    },
    {
      fromId: analyst.id,
      toId: viewer.id,
      amount: 5000,
      notes: 'Gift',
      daysAgo: 50,
    },
    {
      fromId: analyst.id,
      toId: admin.id,
      amount: 9000,
      notes: 'Dues clearance',
      daysAgo: 45,
    },
    {
      fromId: viewer.id,
      toId: analyst.id,
      amount: 3000,
      notes: 'Borrowed return',
      daysAgo: 40,
    },
  ]

  await prisma.transfer.createMany({
    data: transfers.map((t) => {
      const date = new Date()
      date.setDate(date.getDate() - t.daysAgo)
      return {
        fromId: t.fromId,
        toId: t.toId,
        amount: t.amount,
        notes: t.notes,
        createdAt: date,
      }
    }),
  })

  console.log('✅ Seed complete')
  console.log('admin@test.com    → password123  (ADMIN)')
  console.log('analyst@test.com  → password123  (ANALYST)')
  console.log('viewer@test.com   → password123  (VIEWER)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
