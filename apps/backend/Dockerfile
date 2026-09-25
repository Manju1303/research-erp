# ============================================================
# Inzovate Backend — Production Multi-Stage Dockerfile
# ============================================================

# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies needed for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Copy root workspace manifests
COPY package.json package-lock.json turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install all dependencies across workspaces
RUN npm ci

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Generate Prisma Client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build shared package and backend
RUN npm run build -w @inzovate/shared
RUN npm run build -w backend

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl

# Copy manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy generated Prisma Client and built outputs from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist 2>/dev/null || true
COPY --from=builder /app/packages/shared/src ./packages/shared/src
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/start.js ./apps/backend/start.js

# Expose port
EXPOSE 4000

# Set working directory to backend
WORKDIR /app/apps/backend

# Start NestJS production server
CMD ["node", "start.js"]
