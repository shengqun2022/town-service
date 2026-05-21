# town-service

Fastify + **Prisma（SQLite）** 的乡镇管理 API 与小程序公开只读接口；集成 **OpenAPI 文档**（Swagger UI）。

## 环境变量

复制 [`.env.example`](.env.example) 为 `.env` 并按需修改。

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Prisma 连接串，如 `file:./data/town.sqlite`（相对路径相对进程 cwd） |
| `DB_PATH` | 可选；未设置 `DATABASE_URL` 时，会推导为 `file:<绝对路径>` |
| `PORT` | 默认 `3001` |
| `JWT_SECRET` | 生产环境必须修改 |
| `CORS_ORIGIN` | 允许的来源，多个用英文逗号分隔 |

## 本地开发

```bash
cp .env.example .env   # 配置 DATABASE_URL 等
npm install
npx prisma db push
npm run dev
```

- **OpenAPI / Swagger UI**：启动后访问 `http://localhost:3001/docs`（或你的 `PORT`）。
- 首次空库启动时会在进程内执行 `ensureSeeded`（演示镇 + 账号）；也可单独执行 `npm run db:seed`。

## 生产构建

```bash
npm install
npx prisma db push   # 或 prisma migrate deploy（若已建迁移）
npm run build
npm start
```

部署环境需安装依赖（含 `@prisma/client` 与 Prisma 引擎），**不要**只拷贝 `dist/` 单文件而不带 `node_modules`。

## API 前缀

- 管理端（JWT）：`/api/v1/auth/*`、`/api/v1/towns/*`、`/api/v1/users/*`
- 小程序公开只读：`GET /api/v1/public/towns/by-slug/:slug/cms`（仅 `enabled` 的镇）

演示账号：`superadmin` / `super123`，`townadmin` / `town123`；演示镇 slug 为 `sunshine`。
