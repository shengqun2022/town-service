import path from 'node:path'
import { PrismaClient } from '@prisma/client'

/** Support legacy DB_PATH if DATABASE_URL is unset */
function resolveDatabaseUrl(): void {
  if (process.env.DATABASE_URL) return
  const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'town.sqlite')
  process.env.DATABASE_URL = `file:${path.resolve(dbPath)}`
}

resolveDatabaseUrl()

export const prisma = new PrismaClient()
