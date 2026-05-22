# town-service 部署说明

本文把 `.env`、Docker、Nginx 反代、数据库初始化流程串成一条可执行的部署路径，适合在阿里云 ECS 或其它 Linux 服务器上部署 `town-service`。

## 一句话架构

- 应用使用 `Fastify + Prisma + SQLite`
- 数据库存放在 Docker 卷里：`/app/data/town.sqlite`
- 上传文件存放在 Docker 卷里：`/app/uploads`
- 对外访问建议走 Nginx 反代到容器 `3001` 端口
- 上传返回的完整地址由 `PUBLIC_BASE_URL` 决定

## 1. 先了解 3 个关键环境变量

部署前先理解下面 3 个变量，它们决定了服务能否正确启动，以及上传链接是否正确。

| 变量 | 作用 | 生产建议 |
|------|------|----------|
| `DATABASE_URL` | Prisma 数据库连接串 | Docker 内固定为 `file:/app/data/town.sqlite` |
| `JWT_SECRET` | JWT 签名密钥 | 必填，使用随机长字符串，至少 32 字符 |
| `PUBLIC_BASE_URL` | 生成上传文件的公网地址前缀 | 必填，填写对外可访问的 API 基址，如 `https://api.example.com` |

其余常用变量：

- `PORT`：服务端口，默认 `3001`
- `CORS_ORIGIN`：允许前端访问的 origin，多个用英文逗号分隔
- `HOST`：容器监听地址，Docker 环境建议 `0.0.0.0`

## 2. `.env` 怎么写

先复制模板文件：

```bash
cp .env.example .env
```

### 本地开发

本地开发可直接用 `.env.example` 里的默认配置，关键是确保：

- `DATABASE_URL` 指向本机数据文件
- `JWT_SECRET` 只用于开发，不要用于生产
- `PUBLIC_BASE_URL` 可以暂时不填

### 生产部署

生产环境至少修改成这样：

```bash
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

DATABASE_URL=file:/app/data/town.sqlite
JWT_SECRET=replace-with-a-random-strong-secret
CORS_ORIGIN=https://admin.example.com,https://h5.example.com
PUBLIC_BASE_URL=https://api.example.com
```

注意：

- `JWT_SECRET` 一定要换成随机长串
- `PUBLIC_BASE_URL` 不要带末尾 `/`
- `CORS_ORIGIN` 要写完整 origin，包含协议和端口

## 3. Docker 是怎么工作的

仓库里的 `Dockerfile` 是多阶段构建：

1. `deps` 阶段安装依赖
2. `build` 阶段执行 `prisma generate` 和 `npm run build`
3. `runtime` 阶段只保留运行所需内容，并从 `scripts/check-env.js` 开始做启动前检查

镜像运行时会：

- 检查 `DATABASE_URL / JWT_SECRET / PUBLIC_BASE_URL`
- 启动 `dist/index.js`
- 通过 Docker 卷保存 SQLite 和上传文件

### 不要再在容器启动时跑 `prisma db push`

以前的方式是在容器启动时执行 `prisma db push`，现在已经去掉，原因是：

- 启动职责更单一
- 避免“容器起来了但其实配置不对”
- 数据库结构应该在构建/部署流程里明确处理，而不是每次启动都偷偷修改

如果数据库表结构需要变更，建议在部署前明确执行 Prisma 相关命令，再重启服务。

## 4. 数据库初始化流程

服务使用 SQLite，不需要单独的 MySQL/PostgreSQL 容器。

首次部署时，你需要保证数据库文件所在目录存在，并让 Prisma 初始化表结构。

### 首次初始化推荐流程

```bash
docker compose up -d --build
```

首次启动时：

- 代码会连接到 `DATABASE_URL`
- `ensureSeeded` 会在空库中写入演示数据
- SQLite 文件会落到卷里，不会丢失

如果你需要手动初始化，也可以在容器内执行 Prisma 命令：

```bash
docker compose exec api sh
npx prisma db push
```

### 什么时候需要重新初始化

- 第一次部署空库
- 本地删掉了 SQLite 文件
- 你在开发环境改了 `schema.prisma` 并希望同步到数据库

## 5. 完整部署步骤

### 第一步，准备服务器

确保服务器已经安装 Docker 和 Docker Compose。

Ubuntu / Debian 示例：

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
# 重新登录后生效
docker compose version
```

### 第二步，上传代码

把仓库完整放到服务器上，至少要包含这些文件：

- `Dockerfile`
- `docker-compose.yml`
- `.env.example`
- `prisma/`
- `src/`
- `scripts/`

例如放到：`/opt/town-service`

### 第三步，配置 `.env`

```bash
cd /opt/town-service
cp .env.example .env
vim .env
```

检查并修改：

- `JWT_SECRET`
- `CORS_ORIGIN`
- `PUBLIC_BASE_URL`
- 如有需要，调整 `PORT`

### 第四步，构建并启动

```bash
docker compose up -d --build
```

这一步会：

- 构建镜像
- 校验运行环境
- 启动服务
- 自动挂载 SQLite 和 uploads 卷

### 第五步，检查日志

```bash
docker compose ps
docker compose logs --tail=100 api
```

正常情况下你会看到类似：

- `town-service listening on http://...`
- `OpenAPI UI: http://.../docs`

### 第六步，验证接口

在服务器本机执行：

```bash
curl -sI http://127.0.0.1:3001/docs
curl -s http://127.0.0.1:3001/api/v1/public/towns/by-slug/sunshine/cms | head
```

如果本机能通但外网不通，通常是安全组或反代配置问题。

## 6. 反向代理怎么配

生产上更推荐用宿主机 Nginx 或 SLB 终结 HTTPS，再反代到容器。

### 方案 A，直接暴露 3001

适合测试环境或临时联调：

```yaml
ports:
  - "3001:3001"
```

然后安全组放行 `3001`。

### 方案 B，Nginx 反代到本机 3001

更推荐生产使用：

1. 让 Docker 只监听本机：

```yaml
ports:
  - "127.0.0.1:3001:3001"
```

2. Nginx 配置示例：

```nginx
server {
  listen 80;
  server_name api.example.com;
  client_max_body_size 60m;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

3. 证书和 HTTPS 配好后，把：

```bash
PUBLIC_BASE_URL=https://api.example.com
```

4. 这样上传返回的 URL 就会是正确的公网地址。

## 7. 数据和上传文件存放在哪里

Docker Compose 里定义了两个持久化卷：

- `town_data`：SQLite 数据库
- `town_uploads`：头像和媒体文件

容器内路径分别是：

- `/app/data/town.sqlite`
- `/app/uploads`

因此：

- 重建容器不会丢数据
- `docker compose down` 不会删除卷
- `docker compose down -v` 会删除卷，谨慎使用

## 8. 常用运维命令

```bash
# 查看状态
docker compose ps

# 持续看日志
docker compose logs -f api

# 停止服务（保留数据卷）
docker compose down

# 停止并删除数据卷（会清空数据库和上传文件）
docker compose down -v

# 进入容器排查
docker compose exec api sh
```

## 9. 备份建议

建议定期备份 SQLite 卷和上传卷。

示例（按实际卷名调整）：

```bash
docker run --rm -v town-service_town_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/town-data-$(date +%F).tar.gz -C /data .
```

上传文件也可以同样方式备份 `town_uploads`。

## 10. 常见问题

### 10.1 启动时报 `JWT_SECRET is required in production`

说明生产环境 `.env` 没写好。请补上强随机 `JWT_SECRET`。

### 10.2 上传图片返回的地址不对

检查 `PUBLIC_BASE_URL` 是否配置为公网 API 地址，且反代时是否传了 `X-Forwarded-Proto`。

### 10.3 访问浏览器时报 CORS 错误

确认 `CORS_ORIGIN` 是否包含当前前端页面的完整 origin，例如：

```bash
CORS_ORIGIN=https://admin.example.com,https://h5.example.com
```

### 10.4 数据库里没有表

执行：

```bash
docker compose exec api npx prisma db push
```

然后重启服务。

### 10.5 想换端口

修改 `.env` 里的 `PORT`，并同步：

- `docker-compose.yml` 端口映射
- 安全组放行端口
- Nginx 反代目标端口

## 11. 推荐的生产检查清单

部署前建议确认：

- [ ] `.env` 已改好 `JWT_SECRET`
- [ ] `.env` 已改好 `PUBLIC_BASE_URL`
- [ ] `CORS_ORIGIN` 已包含前端域名
- [ ] `docker compose up -d --build` 成功
- [ ] `docker compose logs` 没有报错
- [ ] `/docs` 可访问
- [ ] 公网上传 URL 正确
- [ ] 备份策略已经安排

## 相关文件

- `Dockerfile`
- `docker-compose.yml`
- `.env.example`
- `scripts/check-env.js`
- `.dockerignore`
