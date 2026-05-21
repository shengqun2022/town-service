import type { JwtUser } from './types.js'

declare module 'fastify' {
  interface FastifyRequest {
    auth?: JwtUser
  }
}
