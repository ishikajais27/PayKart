import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('Email already registered')

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, role: true },
  })

  const token = signToken({ id: user.id, role: user.role })
  return { user, token }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Invalid credentials')
  if (!user.isActive) throw new Error('Account is deactivated')

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Invalid credentials')

  const token = signToken({ id: user.id, role: user.role })
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  }
}
