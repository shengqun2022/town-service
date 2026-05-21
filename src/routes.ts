import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import path from 'node:path'
import fs from 'node:fs/promises'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { signToken, parseRole } from './jwt.js'
import { requireAuth, requirePlatform, canAccessTown } from './middleware.js'
import { isPlatformRole } from './types.js'
import { createSeedCmsJson } from './seedCms.js'
import * as S from './openapi-schemas.js'

function buildPublicOrigin(request: FastifyRequest): string {
  const configured = process.env.PUBLIC_BASE_URL?.trim().replace(/\/$/, '')
  if (configured) return configured
  const host = request.headers.host ?? `127.0.0.1:${process.env.PORT ?? '3001'}`
  const xf = request.headers['x-forwarded-proto']
  const proto = typeof xf === 'string' && xf.trim() ? xf.split(',')[0]!.trim() : 'http'
  return `${proto}://${host}`
}

async function readUploadFile(request: FastifyRequest) {
  try {
    return await request.file()
  } catch {
    return null
  }
}

export function registerRoutes(app: FastifyInstance, db: PrismaClient) {
  async function townEnabled(townId: string): Promise<boolean> {
    const row = await db.town.findUnique({ where: { id: townId }, select: { enabled: true } })
    return !!row?.enabled
  }

  async function getCmsJson(townId: string): Promise<string | null> {
    const row = await db.town.findUnique({ where: { id: townId }, select: { cmsJson: true } })
    return row?.cmsJson ?? null
  }

  function sendCmsJson(reply: FastifyReply, json: string) {
    return reply.header('content-type', 'application/json').send(json)
  }

  app.post(
    '/api/v1/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: '登录',
        body: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', minLength: 1 },
            password: { type: 'string', minLength: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            required: ['token', 'user'],
            properties: {
              token: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  role: { type: 'string' },
                  townId: { type: 'string', nullable: true },
                  nickname: { type: 'string', nullable: true },
                  avatarUrl: { type: 'string', nullable: true },
                },
              },
            },
          },
          400: S.err,
          401: S.err,
          403: S.err,
        },
      },
    },
    async (request, reply) => {
      const schema = z.object({ username: z.string().min(1), password: z.string().min(1) })
      const parsed = schema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ code: 'VALIDATION', message: '参数错误' })
      }
      const { username, password } = parsed.data
      const row = await db.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          passwordHash: true,
          role: true,
          townId: true,
          nickname: true,
          avatarUrl: true,
        },
      })
      if (!row || !bcrypt.compareSync(password, row.passwordHash)) {
        return reply.status(401).send({ code: 'BAD_CREDENTIALS', message: '用户名或密码错误' })
      }
      const role = parseRole(row.role)
      if (row.townId) {
        if (!(await townEnabled(row.townId))) {
          return reply.status(403).send({ code: 'TOWN_DISABLED', message: '该镇已停用，无法登录' })
        }
      }
      const token = signToken({ sub: row.id, role, townId: row.townId })
      return reply.send({
        token,
        user: {
          id: row.id,
          username: row.username,
          role,
          townId: row.townId,
          nickname: row.nickname,
          avatarUrl: row.avatarUrl,
        },
      })
    },
  )

  app.get(
    '/api/v1/auth/me',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Auth'],
        summary: '当前用户',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              role: { type: 'string' },
              townId: { type: 'string', nullable: true },
              nickname: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
            },
          },
          401: S.err,
        },
      },
    },
    async (request, reply) => {
      const row = await db.user.findUnique({
        where: { id: request.auth!.sub },
        select: { id: true, username: true, role: true, townId: true, nickname: true, avatarUrl: true },
      })
      if (!row) {
        return reply.status(401).send({ code: 'UNAUTH', message: '用户不存在' })
      }
      return reply.send({
        id: row.id,
        username: row.username,
        role: row.role,
        townId: row.townId,
        nickname: row.nickname,
        avatarUrl: row.avatarUrl,
      })
    },
  )

  const patchMeSchema = z
    .object({
      password: z.string().min(4).optional(),
      nickname: z.union([z.string().max(64), z.literal(''), z.null()]).optional(),
      avatarUrl: z.union([z.string().max(2048), z.literal(''), z.null()]).optional(),
    })
    .refine((b) => b.password != null || b.nickname !== undefined || b.avatarUrl !== undefined, {
      message: '至少提供 password、nickname、avatarUrl 中的一项',
    })

  app.patch(
    '/api/v1/auth/me',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['Auth'],
        summary: '修改本人资料（密码、昵称、头像 URL）',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          properties: {
            password: { type: 'string', minLength: 4 },
            nickname: { type: 'string', nullable: true, maxLength: 64 },
            avatarUrl: { type: 'string', nullable: true, maxLength: 2048 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              role: { type: 'string' },
              townId: { type: 'string', nullable: true },
              nickname: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
            },
          },
          400: S.err,
          401: S.err,
        },
      },
    },
    async (request, reply) => {
      const parsed = patchMeSchema.safeParse(request.body)
      if (!parsed.success) {
        const flat = parsed.error.flatten()
        const msg = flat.formErrors[0] ?? parsed.error.issues[0]?.message ?? '参数错误'
        return reply.status(400).send({ code: 'VALIDATION', message: msg })
      }
      const data: Prisma.UserUpdateInput = {}
      if (parsed.data.password != null) {
        data.passwordHash = bcrypt.hashSync(parsed.data.password, 10)
      }
      if (parsed.data.nickname !== undefined) {
        data.nickname = parsed.data.nickname === '' || parsed.data.nickname === null ? null : parsed.data.nickname
      }
      if (parsed.data.avatarUrl !== undefined) {
        data.avatarUrl =
          parsed.data.avatarUrl === '' || parsed.data.avatarUrl === null ? null : parsed.data.avatarUrl
      }
      await db.user.update({
        where: { id: request.auth!.sub },
        data,
      })
      const row = await db.user.findUniqueOrThrow({
        where: { id: request.auth!.sub },
        select: { id: true, username: true, role: true, townId: true, nickname: true, avatarUrl: true },
      })
      return reply.send({
        id: row.id,
        username: row.username,
        role: row.role,
        townId: row.townId,
        nickname: row.nickname,
        avatarUrl: row.avatarUrl,
      })
    },
  )

  async function storeUpload(request: FastifyRequest, folder: string, allowed: Set<string>, maxSize = 10 * 1024 * 1024) {
    const file = await readUploadFile(request)
    if (!file) return { error: { code: 'VALIDATION', message: '缺少文件字段 file' } as const }
    if (!allowed.has(file.mimetype)) {
      return { error: { code: 'INVALID_TYPE', message: '文件类型不支持' } as const }
    }
    const buf = await file.toBuffer()
    if (buf.length > maxSize) {
      return { error: { code: 'FILE_TOO_LARGE', message: `文件不超过 ${Math.ceil(maxSize / 1024 / 1024)}MB` } as const }
    }
    const ext = path.extname(file.filename || '')
    const safeExt = ext && ext.length <= 8 ? ext : ''
    const filename = `${folder}-${nanoid(16)}${safeExt}`
    const dir = path.join(process.cwd(), 'uploads', folder)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, filename), buf)
    return { url: `${buildPublicOrigin(request)}/static/${folder}/${filename}` }
  }

  app.post(
    '/api/v1/auth/me/avatar',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const result = await storeUpload(request, 'avatars', new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']), 2 * 1024 * 1024)
      if ('error' in result) {
        return reply.status(400).send(result.error)
      }
      await db.user.update({ where: { id: request.auth!.sub }, data: { avatarUrl: result.url } })
      const row = await db.user.findUniqueOrThrow({
        where: { id: request.auth!.sub },
        select: { id: true, username: true, role: true, townId: true, nickname: true, avatarUrl: true },
      })
      return reply.send({ user: row })
    },
  )

  app.post(
    '/api/v1/uploads/image',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const result = await storeUpload(request, 'media', new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']), 10 * 1024 * 1024)
      if ('error' in result) return reply.status(400).send(result.error)
      return reply.send({ url: result.url })
    },
  )

  app.post(
    '/api/v1/uploads/video',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const result = await storeUpload(request, 'media', new Set(['video/mp4', 'video/webm', 'video/quicktime']), 50 * 1024 * 1024)
      if ('error' in result) return reply.status(400).send(result.error)
      return reply.send({ url: result.url })
    },
  )

  app.get(
    '/api/v1/towns',
    {
      preHandler: [requireAuth, requirePlatform],
      schema: {
        tags: ['Towns'],
        summary: '镇列表',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                slug: { type: 'string' },
                enabled: { type: 'boolean' },
                updated_at: { type: 'string' },
              },
            },
          },
          401: S.err,
          403: S.err,
        },
      },
    },
    async (_request, reply) => {
      const rows = await db.town.findMany({ orderBy: { name: 'asc' } })
      return reply.send(
        rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          enabled: r.enabled,
          updated_at: r.updatedAt,
        })),
      )
    },
  )

  const createTownSchema = z.object({
    id: z.string().min(1).optional(),
    name: z.string().min(1),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  })

  app.post(
    '/api/v1/towns',
    {
      preHandler: [requireAuth, requirePlatform],
      schema: {
        tags: ['Towns'],
        summary: '创建镇',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['name', 'slug'],
          properties: {
            id: { type: 'string', minLength: 1 },
            name: { type: 'string', minLength: 1 },
            slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              enabled: { type: 'boolean' },
              updated_at: { type: 'string' },
            },
          },
          400: S.err,
          401: S.err,
          403: S.err,
          409: S.err,
        },
      },
    },
    async (request, reply) => {
      const parsed = createTownSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ code: 'VALIDATION', message: JSON.stringify(parsed.error.flatten()) })
      }
      const id = parsed.data.id ?? `town-${nanoid(8)}`
      const now = new Date().toISOString()
      const cms = createSeedCmsJson(id)
      try {
        await db.town.create({
          data: {
            id,
            name: parsed.data.name,
            slug: parsed.data.slug,
            enabled: true,
            cmsJson: cms,
            updatedAt: now,
          },
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          return reply.status(409).send({ code: 'DUPLICATE', message: '镇 id 或 slug 已存在' })
        }
        throw e
      }
      return reply.status(201).send({ id, name: parsed.data.name, slug: parsed.data.slug, enabled: true, updated_at: now })
    },
  )

  const patchTownSchema = z.object({
    name: z.string().min(1).optional(),
    enabled: z.boolean().optional(),
  })

  app.patch<{ Params: { townId: string } }>(
    '/api/v1/towns/:townId',
    {
      preHandler: [requireAuth, requirePlatform],
      schema: {
        tags: ['Towns'],
        summary: '更新镇',
        security: [{ bearerAuth: [] }],
        params: S.townIdParam,
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1 },
            enabled: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              enabled: { type: 'boolean' },
              updated_at: { type: 'string' },
            },
          },
          400: S.err,
          404: S.err,
          401: S.err,
          403: S.err,
        },
      },
    },
    async (request, reply) => {
      const { townId } = request.params
      const parsed = patchTownSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ code: 'VALIDATION', message: JSON.stringify(parsed.error.flatten()) })
      }
      const exists = await db.town.findUnique({ where: { id: townId }, select: { id: true } })
      if (!exists) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: '乡镇不存在' })
      }
      const now = new Date().toISOString()
      let changed = false
      const data: Prisma.TownUpdateInput = {}
      if (parsed.data.name != null) {
        data.name = parsed.data.name
        changed = true
      }
      if (parsed.data.enabled != null) {
        data.enabled = parsed.data.enabled
        changed = true
      }
      if (changed) {
        data.updatedAt = now
        await db.town.update({ where: { id: townId }, data })
      }
      const row = await db.town.findUniqueOrThrow({ where: { id: townId } })
      return reply.send({
        id: row.id,
        name: row.name,
        slug: row.slug,
        enabled: row.enabled,
        updated_at: row.updatedAt,
      })
    },
  )

  app.get<{ Params: { townId: string } }>(
    '/api/v1/towns/:townId/cms',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['CMS'],
        summary: '获取镇 CMS JSON',
        security: [{ bearerAuth: [] }],
        params: S.townIdParam,
        response: {
          200: { description: '原始 CMS JSON 文档', type: 'object', additionalProperties: true },
          401: S.err,
          403: S.err,
          404: S.err,
        },
      },
    },
    async (request, reply) => {
      const { townId } = request.params
      if (!canAccessTown(request, townId)) {
        return reply.status(403).send({ code: 'FORBIDDEN', message: '无权访问该镇数据' })
      }
      if (!isPlatformRole(request.auth!.role) && !(await townEnabled(townId))) {
        return reply.status(403).send({ code: 'TOWN_DISABLED', message: '该镇已停用' })
      }
      const json = await getCmsJson(townId)
      if (!json) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: '乡镇不存在' })
      }
      return sendCmsJson(reply, json)
    },
  )

  app.put<{ Params: { townId: string } }>(
    '/api/v1/towns/:townId/cms',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['CMS'],
        summary: '保存镇 CMS JSON',
        security: [{ bearerAuth: [] }],
        params: S.townIdParam,
        body: {
          type: 'object',
          additionalProperties: true,
          description:
            '完整镇 CMS JSON（TownCmsState）；常用键含 home.banners、home.promoVideos、products（特色农产品）等',
        },
        response: {
          200: {
            type: 'object',
            properties: { ok: { type: 'boolean' }, updated_at: { type: 'string' } },
          },
          400: S.err,
          401: S.err,
          403: S.err,
          404: S.err,
        },
      },
    },
    async (request, reply) => {
      const { townId } = request.params
      if (!canAccessTown(request, townId)) {
        return reply.status(403).send({ code: 'FORBIDDEN', message: '无权写入该镇数据' })
      }
      if (!(await townEnabled(townId)) && !isPlatformRole(request.auth!.role)) {
        return reply.status(403).send({ code: 'TOWN_DISABLED', message: '该镇已停用' })
      }
      const body = request.body
      if (!body || typeof body !== 'object') {
        return reply.status(400).send({ code: 'VALIDATION', message: '无效 JSON' })
      }
      if ((body as { townId?: string }).townId !== townId) {
        return reply.status(400).send({ code: 'TOWN_MISMATCH', message: 'JSON.townId 必须与路径一致' })
      }
      const now = new Date().toISOString()
      const json = JSON.stringify(body)
      const r = await db.town.updateMany({ where: { id: townId }, data: { cmsJson: json, updatedAt: now } })
      if (r.count === 0) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: '乡镇不存在' })
      }
      return reply.send({ ok: true, updated_at: now })
    },
  )

  app.post<{ Params: { townId: string } }>(
    '/api/v1/towns/:townId/cms/reset',
    {
      preHandler: [requireAuth],
      schema: {
        tags: ['CMS'],
        summary: '重置 CMS 为演示数据',
        security: [{ bearerAuth: [] }],
        params: S.townIdParam,
        response: {
          200: { description: '种子 CMS JSON', type: 'object', additionalProperties: true },
          401: S.err,
          403: S.err,
        },
      },
    },
    async (request, reply) => {
      const { townId } = request.params
      if (!canAccessTown(request, townId)) {
        return reply.status(403).send({ code: 'FORBIDDEN', message: '无权操作' })
      }
      if (!isPlatformRole(request.auth!.role) && !(await townEnabled(townId))) {
        return reply.status(403).send({ code: 'TOWN_DISABLED', message: '该镇已停用' })
      }
      const now = new Date().toISOString()
      const cms = createSeedCmsJson(townId)
      await db.town.update({ where: { id: townId }, data: { cmsJson: cms, updatedAt: now } })
      return sendCmsJson(reply, cms)
    },
  )

  app.get<{ Params: { townId: string } }>(
    '/api/v1/towns/:townId/users',
    {
      preHandler: [requireAuth, requirePlatform],
      schema: {
        tags: ['Users'],
        summary: '镇下用户列表',
        security: [{ bearerAuth: [] }],
        params: S.townIdParam,
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                username: { type: 'string' },
                role: { type: 'string' },
                townId: { type: 'string', nullable: true },
                nickname: { type: 'string', nullable: true },
                avatarUrl: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
              },
            },
          },
          401: S.err,
          403: S.err,
          404: S.err,
        },
      },
    },
    async (request, reply) => {
      const { townId } = request.params
      const t = await db.town.findUnique({ where: { id: townId }, select: { id: true } })
      if (!t) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: '乡镇不存在' })
      }
      const rows = await db.user.findMany({
        where: { townId },
        orderBy: { username: 'asc' },
        select: {
          id: true,
          username: true,
          role: true,
          townId: true,
          nickname: true,
          avatarUrl: true,
          createdAt: true,
        },
      })
      return reply.send(rows)
    },
  )

  const createUserSchema = z.object({
    username: z.string().min(2),
    password: z.string().min(4),
    role: z.enum(['TOWN_ADMIN', 'TOWN_EDITOR', 'PLATFORM_OPS']),
    townId: z.string().min(1).nullable(),
    nickname: z.string().max(64).optional(),
    avatarUrl: z.string().max(2048).optional(),
  })

  app.post(
    '/api/v1/users',
    {
      preHandler: [requireAuth, requirePlatform],
      schema: {
        tags: ['Users'],
        summary: '创建用户',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['username', 'password', 'role'],
          properties: {
            username: { type: 'string', minLength: 2 },
            password: { type: 'string', minLength: 4 },
            role: { type: 'string', enum: ['TOWN_ADMIN', 'TOWN_EDITOR', 'PLATFORM_OPS'] },
            townId: { type: 'string', nullable: true },
            nickname: { type: 'string', maxLength: 64 },
            avatarUrl: { type: 'string', maxLength: 2048 },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              role: { type: 'string' },
              townId: { type: 'string', nullable: true },
              nickname: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
            },
          },
          400: S.err,
          401: S.err,
          403: S.err,
          409: S.err,
        },
      },
    },
    async (request, reply) => {
      const parsed = createUserSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ code: 'VALIDATION', message: JSON.stringify(parsed.error.flatten()) })
      }
      const { username, password, role, townId, nickname, avatarUrl } = parsed.data
      if (role === 'PLATFORM_OPS' && townId != null) {
        return reply.status(400).send({ code: 'VALIDATION', message: '平台运维账号不应绑定镇' })
      }
      if (role !== 'PLATFORM_OPS' && !townId) {
        return reply.status(400).send({ code: 'VALIDATION', message: '乡镇账号必须指定 townId' })
      }
      if (townId) {
        const t = await db.town.findUnique({ where: { id: townId }, select: { id: true } })
        if (!t) {
          return reply.status(400).send({ code: 'NOT_FOUND', message: '镇不存在' })
        }
      }
      const id = nanoid()
      const hash = bcrypt.hashSync(password, 10)
      const now = new Date().toISOString()
      try {
        await db.user.create({
          data: {
            id,
            username,
            passwordHash: hash,
            role,
            townId: townId ?? null,
            nickname: nickname ?? null,
            avatarUrl: avatarUrl ?? null,
            createdAt: now,
          },
        })
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          return reply.status(409).send({ code: 'DUPLICATE', message: '用户名已存在' })
        }
        throw e
      }
      return reply.status(201).send({
        id,
        username,
        role,
        townId: townId ?? null,
        nickname: nickname ?? null,
        avatarUrl: avatarUrl ?? null,
      })
    },
  )

  const patchUserSchema = z.object({
    password: z.string().min(4).optional(),
    role: z.enum(['TOWN_ADMIN', 'TOWN_EDITOR', 'PLATFORM_OPS']).optional(),
    nickname: z.union([z.string().max(64), z.literal(''), z.null()]).optional(),
    avatarUrl: z.union([z.string().max(2048), z.literal(''), z.null()]).optional(),
  })

  app.patch<{ Params: { userId: string } }>(
    '/api/v1/users/:userId',
    {
      preHandler: [requireAuth, requirePlatform],
      schema: {
        tags: ['Users'],
        summary: '更新用户',
        security: [{ bearerAuth: [] }],
        params: S.userIdParam,
        body: {
          type: 'object',
          properties: {
            password: { type: 'string', minLength: 4 },
            role: { type: 'string', enum: ['TOWN_ADMIN', 'TOWN_EDITOR', 'PLATFORM_OPS'] },
            nickname: { type: 'string', nullable: true, maxLength: 64 },
            avatarUrl: { type: 'string', nullable: true, maxLength: 2048 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              role: { type: 'string' },
              townId: { type: 'string', nullable: true },
              nickname: { type: 'string', nullable: true },
              avatarUrl: { type: 'string', nullable: true },
            },
          },
          400: S.err,
          401: S.err,
          403: S.err,
          404: S.err,
        },
      },
    },
    async (request, reply) => {
      const { userId } = request.params
      const parsed = patchUserSchema.safeParse(request.body)
      if (!parsed.success) {
        return reply.status(400).send({ code: 'VALIDATION', message: JSON.stringify(parsed.error.flatten()) })
      }
      const row = await db.user.findUnique({ where: { id: userId } })
      if (!row) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: '用户不存在' })
      }
      if (row.role === 'SUPER_ADMIN') {
        return reply.status(403).send({ code: 'FORBIDDEN', message: '不可修改超级管理员' })
      }
      const data: Prisma.UserUpdateInput = {}
      if (parsed.data.password) {
        data.passwordHash = bcrypt.hashSync(parsed.data.password, 10)
      }
      if (parsed.data.role) {
        data.role = parsed.data.role
      }
      if (parsed.data.nickname !== undefined) {
        data.nickname = parsed.data.nickname === '' || parsed.data.nickname === null ? null : parsed.data.nickname
      }
      if (parsed.data.avatarUrl !== undefined) {
        data.avatarUrl =
          parsed.data.avatarUrl === '' || parsed.data.avatarUrl === null ? null : parsed.data.avatarUrl
      }
      if (Object.keys(data).length > 0) {
        await db.user.update({ where: { id: userId }, data })
      }
      const out = await db.user.findUniqueOrThrow({
        where: { id: userId },
        select: { id: true, username: true, role: true, townId: true, nickname: true, avatarUrl: true },
      })
      return reply.send(out)
    },
  )

  app.get<{ Params: { slug: string } }>(
    '/api/v1/public/towns/by-slug/:slug/cms',
    {
      schema: {
        tags: ['Public'],
        summary: '按 slug 获取已启用镇的公开 CMS',
        params: S.slugParam,
        response: {
          200: { description: 'CMS JSON', type: 'object', additionalProperties: true },
          404: S.err,
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params
      const row = await db.town.findFirst({
        where: { slug, enabled: true },
        select: { cmsJson: true },
      })
      if (!row) {
        return reply.status(404).send({ code: 'NOT_FOUND', message: '乡镇不存在或未启用' })
      }
      return sendCmsJson(reply, row.cmsJson)
    },
  )
}
