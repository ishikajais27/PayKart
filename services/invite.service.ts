import { prisma } from '@/lib/prisma'
import { logAudit } from '@/services/audit.service'
import { Role } from '@/types'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

async function sendInviteEmail(email: string, token: string, role: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite/accept?token=${token}`

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"FinanceApp" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'You are invited to FinanceApp',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0f1e;color:#e2e8f0;border-radius:16px;">
        <h2 style="color:#818cf8;margin-bottom:8px;">You've been invited!</h2>
        <p style="color:#94a3b8;margin-bottom:24px;">
          You have been invited to join <strong style="color:#f1f5f9;">FinanceApp</strong> as a <strong style="color:#818cf8;">${role}</strong>.
        </p>
        <a href="${inviteUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
          Accept Invite
        </a>
        <p style="margin-top:24px;color:#64748b;font-size:13px;">
          Or copy this link:<br/>
          <span style="color:#818cf8;word-break:break-all;">${inviteUrl}</span>
        </p>
        <p style="margin-top:16px;color:#64748b;font-size:12px;">This link expires in 48 hours.</p>
      </div>
    `,
  })
}

export async function createInvite(adminId: string, email: string, role: Role) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error('User with this email already exists')

  const pending = await prisma.inviteToken.findFirst({
    where: { email, usedAt: null, expiresAt: { gt: new Date() } },
  })
  if (pending) throw new Error('An active invite already exists for this email')

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48)

  const invite = await prisma.inviteToken.create({
    data: { token, email, role, expiresAt, createdBy: adminId },
  })

  await logAudit({
    userId: adminId,
    action: 'CREATE_INVITE',
    entity: 'InviteToken',
    entityId: invite.id,
    after: { email, role },
  })

  try {
    await sendInviteEmail(email, token, role)
  } catch (e) {
    console.error('Failed to send invite email:', e)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return {
    token,
    email,
    role,
    expiresAt,
    inviteUrl: `${baseUrl}/invite/accept?token=${token}`,
  }
}

export async function acceptInvite(
  token: string,
  name: string,
  password: string,
) {
  const invite = await prisma.inviteToken.findUnique({ where: { token } })
  if (!invite) throw new Error('Invalid invite token')
  if (invite.usedAt) throw new Error('Invite token already used')
  if (new Date() > invite.expiresAt) throw new Error('Invite token has expired')

  const existing = await prisma.user.findUnique({
    where: { email: invite.email },
  })
  if (existing) throw new Error('Email already registered')

  const bcrypt = await import('bcryptjs')
  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email: invite.email, password: hashed, role: invite.role },
    select: { id: true, name: true, email: true, role: true },
  })

  await prisma.inviteToken.update({
    where: { token },
    data: { usedAt: new Date() },
  })

  const { signToken } = await import('@/lib/auth')
  const jwtToken = signToken({ id: user.id, role: user.role })

  return { user, token: jwtToken }
}

export async function listInvites(_adminId: string) {
  return prisma.inviteToken.findMany({
    orderBy: { createdAt: 'desc' },
    include: { creator: { select: { name: true, email: true } } },
  })
}
