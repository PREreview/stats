.PHONY: start

export OBSERVABLE_TELEMETRY_DISABLE := 1

node_modules: package.json package-lock.json
	npm install
	touch node_modules

start: node_modules
	npx observable preview