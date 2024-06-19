FROM node:20.13.1-alpine3.18
WORKDIR /app

COPY package.json \
  package-lock.json \
  ./
RUN npm ci --ignore-scripts
COPY observablehq.config.js observablehq.config.js
COPY src/ src/
RUN npm run build
