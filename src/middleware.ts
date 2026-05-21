import type { FastifyReply, FastifyRequest } from 'fastify'
import { verifyToken } from './jwt.js'
import { isPlatformRole } from './types.js'

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const h = request.headers.authorization
  if (!h?.startsWith('Bearer ')) {
    return reply.status(401).send({ code: 'UNAUTH', message: '未登录' })
  }
  try {
    request.auth = verifyToken(h.slice(7))
  } catch {
    return reply.status(401).send({ code: 'UNAUTH', message: '令牌无效' })
  }
}

export async function requirePlatform(request: FastifyRequest, reply: FastifyReply) {
  if (!request.auth || !isPlatformRole(request.auth.role)) {
    return reply.status(403).send({ code: 'FORBIDDEN', message: '需要平台管理员权限' })
  }
}

export function canAccessTown(request: FastifyRequest, townId: string): boolean {
  const auth = request.auth
  if (!auth) return false
  if (isPlatformRole(auth.role)) return true
  return auth.townId === townId
}
