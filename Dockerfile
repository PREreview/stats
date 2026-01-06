FROM caddy:2.10.2-alpine AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY dist/ /usr/share/caddy
EXPOSE 80
