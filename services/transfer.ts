import { prisma } from '@/lib/prisma'
import { logAudit } from '@/services/audit'

export async function sendMoney(
  fromId: string,
  toEmail: string,
  amount: number,
  notes?: string,
) {
  if (amount <= 0) throw new Error('Amount must be greater than zero')

  const sender = await prisma.user.findUnique({ where: { id: fromId } })
  if (!sender) throw new Error('Sender not found')
  if (!sender.isActive) throw new Error('Sender account is deactivated')
  if (sender.balance < amount) throw new Error('Insufficient balance')

  const receiver = await prisma.user.findUnique({ where: { email: toEmail } })
  if (!receiver) throw new Error('Receiver email does not exist')
  if (!receiver.isActive) throw new Error('Receiver account is deactivated')
  if (receiver.id === fromId) throw new Error('Cannot send money to yourself')

  const [transfer] = await prisma.$transaction([
    prisma.transfer.create({
      data: { fromId, toId: receiver.id, amount, notes },
    }),
    prisma.user.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    }),
    prisma.user.update({
      where: { id: receiver.id },
      data: { balance: { increment: amount } },
    }),
  ])

  await logAudit({
    userId: fromId,
    action: 'TRANSFER',
    entity: 'Transfer',
    entityId: transfer.id,
    after: { toEmail, amount, notes },
  })

  return {
    message: `Successfully sent ₹${amount} to ${receiver.name} (${toEmail})`,
    newBalance: sender.balance - amount,
  }
}

export async function getTransferHistory(userId: string, role: string) {
  if (role === 'ADMIN') {
    return prisma.transfer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        from: { select: { id: true, name: true, email: true } },
        to: { select: { id: true, name: true, email: true } },
      },
    })
  }

  return prisma.transfer.findMany({
    where: { OR: [{ fromId: userId }, { toId: userId }] },
    orderBy: { createdAt: 'desc' },
    include: {
      from: { select: { id: true, name: true, email: true } },
      to: { select: { id: true, name: true, email: true } },
    },
  })
}
