FROM node:20.13.1-alpine3.18 AS builder
WORKDIR /app

COPY package.json \
  package-lock.json \
  ./
RUN npm ci --ignore-scripts --production
COPY observablehq.config.js observablehq.config.js
COPY src/ src/

FROM builder AS build
RUN npx observable build

FROM caddy AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80
