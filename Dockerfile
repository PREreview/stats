FROM node:20.13.1-alpine3.18 as build
WORKDIR /app

COPY package.json \
  package-lock.json \
  ./
RUN npm ci --ignore-scripts
COPY observablehq.config.js observablehq.config.js
COPY src/ src/
RUN npx observable build

FROM caddy AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /usr/share/caddy
EXPOSE 80
