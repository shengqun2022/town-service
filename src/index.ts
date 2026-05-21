import path from 'node:path'
import fs from 'node:fs'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { prisma } from './prisma.js'
import { ensureSeeded } from './seed-db.js'
import { registerRoutes } from './routes.js'

const PORT = Number(process.env.PORT) || 3001
const UPLOADS_DIR = path.join(process.cwd(), 'uploads')
const AVATARS_DIR = path.join(UPLOADS_DIR, 'avatars')
const MEDIA_DIR = path.join(UPLOADS_DIR, 'media')
fs.mkdirSync(AVATARS_DIR, { recursive: true })
fs.mkdirSync(MEDIA_DIR, { recursive: true })

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5174')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

async function main() {
  const app = Fastify({
    bodyLimit: 60 * 1024 * 1024,
  })

  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'town-service',
        version: '0.1.0',
        description: '乡镇 CMS 与管理 API（Prisma + SQLite）',
      },
      servers: [{ url: '/', description: '当前主机' }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: '登录接口返回的 token',
          },
        },
      },
    },
  })

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      return cb(null, corsOrigins.includes(origin))
    },
    credentials: true,
  })

  await app.register(multipart, {
    limits: { fileSize: 50 * 1024 * 1024 },
  })

  await ensureSeeded(prisma)
  registerRoutes(app, prisma)

  await app.register(fastifyStatic, {
    root: UPLOADS_DIR,
    decorateReply: false,
    prefix: '/static/',
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  })

  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`town-service listening on http://localhost:${PORT}`)
  console.log(`OpenAPI UI: http://localhost:${PORT}/docs`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
