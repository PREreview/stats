FROM caddy:2.8.4-alpine AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY dist/ /usr/share/caddy
EXPOSE 80
