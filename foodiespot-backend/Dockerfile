FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --omit=dev --no-audit --no-fund

FROM node:22-alpine AS test-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

FROM node:22-alpine AS runtime
RUN addgroup -S foodiespot && adduser -S foodiespot -G foodiespot
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=foodiespot:foodiespot . .
RUN mkdir -p /app/data /app/uploads && chown -R foodiespot:foodiespot /app/data /app/uploads
USER foodiespot
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1
CMD ["node", "server.js"]

FROM node:22-alpine AS tester
WORKDIR /app
COPY --from=test-deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /app/data /app/uploads
