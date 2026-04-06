
FROM node:20-alpine AS base

FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./

RUN if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps || npm install --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi && \
    npm cache clean --force

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN ls -la node_modules/vite/dist/node/chunks/ || echo "Vite chunks not found, will reinstall" && \
    npm list vite || npm install vite@^5.4.21 --save-dev

RUN npm run build

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=builder /app/dist .

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 