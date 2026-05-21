/** Shared JSON Schema fragments for @fastify/swagger */

export const err = {
  type: 'object',
  properties: {
    code: { type: 'string' },
    message: { type: 'string' },
  },
  required: ['code', 'message'],
} as const

export const townIdParam = {
  type: 'object',
  required: ['townId'],
  properties: { townId: { type: 'string', minLength: 1 } },
} as const

export const userIdParam = {
  type: 'object',
  required: ['userId'],
  properties: { userId: { type: 'string', minLength: 1 } },
} as const

export const slugParam = {
  type: 'object',
  required: ['slug'],
  properties: { slug: { type: 'string', minLength: 1 } },
} as const
