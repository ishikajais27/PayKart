import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  const users = [
    { name: 'Admin User', email: 'admin@test.com', password, role: Role.ADMIN },
    {
      name: 'Analyst User',
      email: 'analyst@test.com',
      password,
      role: Role.ANALYST,
    },
    {
      name: 'Viewer User',
      email: 'viewer@test.com',
      password,
      role: Role.VIEWER,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  console.log('Seeded successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
