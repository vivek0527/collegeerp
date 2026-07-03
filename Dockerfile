FROM node:20-alpine

WORKDIR /app

# Install build tools if any native modules need compilation
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Generate Prisma Client (needed for database queries)
RUN npx prisma generate

# Build Next.js
RUN npm run build

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV NODE_ENV production

# We will run db migrations and seed first using entrypoint, or run it directly
CMD ["npm", "run", "start"]
