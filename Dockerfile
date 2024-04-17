# # Use the super official Node.js image as the base  
# FROM node:20-alpine

# # Set the working directory inside the container  
# WORKDIR /app    

# # Copy package.json and package-lock.json to the container  
# COPY package*.json ./

# # RUN npm ci  
# RUN npm install  

# # Copy the app source code to the container  
# COPY . .  

# # Build the Next.js app  
# RUN npm run build  

# # Expose the port the app will run on  
# EXPOSE 3000

# # Start the app  
# CMD ["npm", "start"]  









# FROM node:20-alpine as builder
# WORKDIR /my-space

# COPY package.json package-lock.json ./
# RUN npm ci
# COPY . .
# RUN npm run build

# FROM node:20-alpine as runner
# WORKDIR /my-space
# COPY --from=builder /my-space/package.json .
# COPY --from=builder /my-space/package-lock.json .
# COPY --from=builder /my-space/next.config.js ./
# COPY --from=builder /my-space/public ./public
# COPY --from=builder /my-space/.next/standalone ./
# COPY --from=builder /my-space/.next/static ./.next/static
# EXPOSE 3000
# ENTRYPOINT ["npm", "start"]








# # Install Node base image with Alpine Ubuntu
# FROM node:20.11-alpine AS base

# FROM base AS deps
# # Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
# WORKDIR /app
# # Copy dependency lists
# # COPY package.json pnpm-lock.yaml* ./
# COPY package*.json  pnpm-lock.yaml* ./
# # Enable corepack for pnpm
# RUN corepack enable pnpm
# # Install dependencies using pnpm
# # RUN pnpm i --frozen-lockfile
# RUN pnpm i




# # Rebuild the source code only when needed
# FROM base AS builder
# WORKDIR /app
# COPY . .
# COPY --from=deps /app/node_modules ./node_modules
# # Generate Prisma Client
# # RUN npx prisma db push
# # RUN npx prisma generate
# # Enable corepack for pnpm and install dependencies
# RUN corepack enable pnpm && pnpm build


# # Production image, copy all the files and run next
# FROM base AS runner
# WORKDIR /app

# ENV NODE_ENV production
# # Disable NextJS telemetry during runtime
# ENV NEXT_TELEMETRY_DISABLED 1

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# COPY --from=builder /app/public ./public

# # Set the correct permission for prerender cache
# RUN mkdir .next
# RUN chown nextjs:nodejs .next

# # Automatically leverage output traces to reduce image size
# # https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# USER nextjs

# EXPOSE 3000

# ENV PORT 3000
# # set hostname to localhost
# ENV HOSTNAME "0.0.0.0"

# # server.js is created by next build from the standalone output
# # https://nextjs.org/docs/pages/api-reference/next-config-js/output
# CMD ["node", "server.js"]















# FROM node:18-alpine AS base
FROM node:20.11-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
