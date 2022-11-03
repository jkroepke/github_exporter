FROM node:lts-alpine

EXPOSE 9171

ENV NODE_ENV=production HUSKY=0

WORKDIR /opt/github_exporter

COPY . .

RUN apk add --no-cache tini && \
  npm install --production --quiet

USER 1001

ENTRYPOINT ["/sbin/tini", "--", "/opt/github_exporter/index.js"]
