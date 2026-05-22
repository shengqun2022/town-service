import jwt from 'jsonwebtoken'
import type { JwtUser, UserRole } from './types.js'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production')
  }
  return 'dev-only-change-in-production'
}

const JWT_SECRET = getJwtSecret()

export function signToken(user: JwtUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtUser {
  return jwt.verify(token, JWT_SECRET) as JwtUser
}

export function parseRole(r: string): UserRole {
  const allowed: UserRole[] = ['SUPER_ADMIN', 'PLATFORM_OPS', 'TOWN_ADMIN', 'TOWN_EDITOR']
  if (!allowed.includes(r as UserRole)) throw new Error('invalid role')
  return r as UserRole
}
