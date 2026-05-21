export type UserRole = 'SUPER_ADMIN' | 'PLATFORM_OPS' | 'TOWN_ADMIN' | 'TOWN_EDITOR'

export const PLATFORM_ROLES: UserRole[] = ['SUPER_ADMIN', 'PLATFORM_OPS']

export function isPlatformRole(role: UserRole): boolean {
  return PLATFORM_ROLES.includes(role)
}

export interface JwtUser {
  sub: string
  role: UserRole
  /** 乡镇账号绑定镇；平台账号为 null */
  townId: string | null
}
