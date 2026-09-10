FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npx tsc -p tsconfig.server.build.json

FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/build ./build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build/server/index.js"]
