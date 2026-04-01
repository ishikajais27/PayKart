import { prisma } from '@/lib/prisma'
import { Role } from '@/types'

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  })
  if (!user) throw new Error('User not found')
  return user
}

export async function updateUser(
  id: string,
  data: { name?: string; role?: Role; isActive?: boolean },
) {
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error('User not found')

  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })
}
