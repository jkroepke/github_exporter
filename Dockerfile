FROM node:lts-alpine AS builder

WORKDIR /build

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --quiet

COPY . .

RUN npm run build

FROM node:lts-alpine

EXPOSE 9171

ENV NODE_ENV=production HUSKY=0

WORKDIR /opt/github_exporter

COPY package*.json ./

RUN apk add --no-cache tini && npm ci --omit=dev --quiet --ignore-scripts

COPY --from=builder /build/dist ./dist
COPY --from=builder /build/templates ./templates

USER 1001

ENTRYPOINT ["/sbin/tini", "--", "node", "--enable-source-maps", "/opt/github_exporter/dist/index.js"]
