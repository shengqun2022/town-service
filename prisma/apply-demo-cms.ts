/**
 * 将 createSeedCmsJson 写入已有镇（含轮播 linkType、视频 linkUrl/playMode 等与种子一致的全量 CMS）。
 * 用法：`npm run db:apply-demo-cms` 或 `TOWN_ID=town-sunshine npm run db:apply-demo-cms`
 */
import { prisma } from '../src/prisma.js'
import { createSeedCmsJson } from '../src/seedCms.js'

async function main() {
  const townId = process.env.TOWN_ID || 'town-sunshine'
  const cmsJson = createSeedCmsJson(townId)
  const now = new Date().toISOString()
  const r = await prisma.town.updateMany({
    where: { id: townId },
    data: { cmsJson, updatedAt: now },
  })
  if (r.count === 0) {
    console.error(`未找到 id 为「${townId}」的镇，请先 db:seed 或创建该镇。`)
    process.exit(1)
  }
  console.log(`已写入演示 CMS：${townId}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
