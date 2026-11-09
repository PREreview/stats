FROM caddy:2.11.9-alpine AS prod
COPY Caddyfile /etc/caddy/Caddyfile
COPY dist/ /usr/share/caddy
EXPOSE 80
