const isProduction = process.env.NODE_ENV === 'production'

function fail(message) {
  console.error(`[check-env] ${message}`)
  process.exit(1)
}

const jwtSecret = process.env.JWT_SECRET?.trim()
if (isProduction && !jwtSecret) {
  fail('JWT_SECRET is required in production')
}
if (jwtSecret && jwtSecret.length < 32) {
  fail('JWT_SECRET should be at least 32 characters long')
}

const publicBaseUrl = process.env.PUBLIC_BASE_URL?.trim()
if (isProduction && !publicBaseUrl) {
  fail('PUBLIC_BASE_URL is required in production')
}
if (publicBaseUrl && !/^https?:\/\//i.test(publicBaseUrl)) {
  fail('PUBLIC_BASE_URL must start with http:// or https://')
}

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) {
  fail('DATABASE_URL is required')
}

console.log('[check-env] environment looks good')
