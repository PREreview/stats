FROM node:21.7.3-alpine3.18 AS builder
WORKDIR /app
ENV OBSERVABLE_TELEMETRY_DISABLE=1

COPY package.json \
  package-lock.json \
  ./
RUN npm ci --ignore-scripts --production
COPY observablehq.config.js observablehq.config.js
COPY src/ src/

FROM builder AS build
RUN npx observable build

FROM caddy:2.8.4-alpine AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80
