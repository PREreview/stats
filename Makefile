.PHONY: build build-image check format lint playwright-browser prod start test test-integration typecheck

CADDY_PASSWORD=letmein
IMAGE_TAG=prereview-stats

export OBSERVABLE_TELEMETRY_DISABLE := 1

node_modules: package.json package-lock.json
	npm install
	touch node_modules

.env:
	cp .env.dist .env

start: .env node_modules
	npx @dotenvx/dotenvx run -- npx observable preview

build: .env node_modules
	npx @dotenvx/dotenvx run -- npx observable build

build-image: build
	docker build --target prod --tag ${IMAGE_TAG} .

check: format lint test typecheck

format: node_modules
	npx prettier --ignore-unknown --check '**'

lint: node_modules
	npx eslint . --max-warnings 0

test: node_modules
	npx vitest run

playwright-browser: node_modules
	npx playwright install chromium

test-integration: build node_modules playwright-browser
	npx playwright test

typecheck: node_modules
	npx tsc --noEmit

.dev/caddy-env: build-image
	@mkdir -p .dev
	@echo 'PASSWORD=$(shell docker run --rm ${IMAGE_TAG} caddy hash-password --plaintext ${CADDY_PASSWORD})' > .dev/caddy-env

prod: .dev/caddy-env build-image
	docker run --rm --publish 8080:80 --env-file .dev/caddy-env ${IMAGE_TAG}
