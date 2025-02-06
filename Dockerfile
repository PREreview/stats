FROM caddy:2.9.1-alpine AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY dist/ /usr/share/caddy
EXPOSE 80
