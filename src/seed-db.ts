import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import type { PrismaClient } from '@prisma/client'
import { createSeedCmsJson } from './seedCms.js'

/** Idempotent: ensure demo town + users exist and demo CMS is stored in DB */
export async function ensureSeeded(db: PrismaClient): Promise<void> {
  const now = new Date().toISOString()
  const townId = 'town-sunshine'
  const superHash = bcrypt.hashSync('super123', 10)
  const townHash = bcrypt.hashSync('town123', 10)
  const cmsJson = createSeedCmsJson(townId)

  await db.town.upsert({
    where: { id: townId },
    create: {
      id: townId,
      name: '阳光镇',
      slug: 'sunshine',
      enabled: true,
      cmsJson,
      updatedAt: now,
    },
    update: {
      name: '阳光镇',
      slug: 'sunshine',
      enabled: true,
      cmsJson,
      updatedAt: now,
    },
  })

  await db.user.upsert({
    where: { username: 'superadmin' },
    create: {
      id: nanoid(),
      username: 'superadmin',
      passwordHash: superHash,
      role: 'SUPER_ADMIN',
      townId: null,
      createdAt: now,
    },
    update: {
      passwordHash: superHash,
      role: 'SUPER_ADMIN',
      townId: null,
    },
  })

  await db.user.upsert({
    where: { username: 'townadmin' },
    create: {
      id: nanoid(),
      username: 'townadmin',
      passwordHash: townHash,
      role: 'TOWN_ADMIN',
      townId,
      createdAt: now,
    },
    update: {
      passwordHash: townHash,
      role: 'TOWN_ADMIN',
      townId,
    },
  })
}
