import { prisma } from '../src/prisma.js'
import { ensureSeeded } from '../src/seed-db.js'

async function main() {
  await ensureSeeded(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
