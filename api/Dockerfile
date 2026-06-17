FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN yarn install --frozen-lockfile 2>/dev/null || yarn install

COPY . .
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
RUN yarn install --production --frozen-lockfile 2>/dev/null || yarn install --production

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/storage

EXPOSE 3000

CMD ["node", "dist/main.cjs"]
