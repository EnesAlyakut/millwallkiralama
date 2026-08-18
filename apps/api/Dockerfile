FROM node:18-alpine AS alpine

# Setup pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Prune step
FROM alpine AS pruner
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@kiralama/api --docker

# 2. Build step
FROM alpine AS builder
WORKDIR /app

# Install dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma client before building
RUN cd packages/database && pnpm exec prisma generate
RUN pnpm run build --filter=@kiralama/api...

# 3. Runner step
FROM alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3001

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

# Copy package.json and dist files
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy prisma schema for runtime if needed
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# We need node_modules for the API to run since it's not bundled like Next.js standalone
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules

USER api

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
