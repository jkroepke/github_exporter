FROM node:lts-alpine

ENV NODE_ENV=production

RUN apk add --no-cache tini

WORKDIR /opt/github_exporter

COPY package*.json .

RUN npm install --production --quiet

COPY . .

USER 1001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/opt/github_exporter/index.js"]
