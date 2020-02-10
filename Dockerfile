FROM node:lts-alpine

ARG VERSION=unknown
ARG VCS_REF=unknown
ARG BUILD_DATE=unknown

# https://github.com/opencontainers/image-spec/blob/master/annotations.md#pre-defined-annotation-keys
LABEL name="jkroepke/github_exporter" \
      maintainer="Jan-Otto Kröpke <github@jkroepke.de>" \
      description="Export various metrics including insights about github repositories" \
      url="https://github.com/jkroepke/github_exporter" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.authors="Jan-Otto Kröpke <github@jkroepke.de>" \
      org.opencontainers.image.url="https://github.com/jkroepke/github_exporter" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.source="https://github.com/jkroepke/github_exporter" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.title="jkroepke/github_exporter" \
      org.opencontainers.image.description="Export various metrics including insights about github repositories" \
      org.label-schema.build-date="${BUILD_DATE}" \
      org.label-schema.version="${VERSION}" \
      org.label-schema.vcs-url="https://github.com/jkroepke/github_exporter" \
      org.label-schema.vcs-ref="${VCS_REF}" \
      org.label-schema.license="MIT" \
      org.label-schema.name="jkroepke/github_exporter" \
      org.label-schema.description="Export various metrics including insights about github repositories"

EXPOSE 9171

ENV NODE_ENV=production

WORKDIR /opt/github_exporter

COPY . .

RUN apk add --no-cache tini && \
  npm install --production --quiet

USER 1001

ENTRYPOINT ["/sbin/tini", "--", "/opt/github_exporter/index.js"]
