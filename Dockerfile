FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN mkdir -p /app/data /app/uploads/avatars /app/uploads/media
COPY --from=build /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY scripts ./scripts
COPY --from=build /app/dist ./dist
RUN chmod +x /app/scripts/entrypoint.sh
EXPOSE 3001
CMD ["sh", "/app/scripts/entrypoint.sh"]