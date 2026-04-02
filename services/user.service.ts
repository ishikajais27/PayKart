import { prisma } from '@/lib/prisma'

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      balance: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
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
      balance: true,
      createdAt: true,
    },
  })
  if (!user) throw new Error('User not found')
  return user
}

export async function updateUser(
  id: string,
  data: { role?: string; isActive?: boolean; name?: string },
) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      balance: true,
    },
  })
}

export async function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } })
}
