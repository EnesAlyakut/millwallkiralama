FROM node:20-alpine AS alpine

# Setup pnpm
RUN npm install -g pnpm

# 1. Prune step
FROM alpine AS pruner
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@kiralama/web --docker

# 2. Build step
FROM alpine AS builder
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm run build --filter=@kiralama/web...

# 3. Runner step
FROM alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3050

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/next.config.ts .
COPY --from=builder /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3050

ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
