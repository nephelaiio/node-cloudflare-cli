.PHONY: install lint eslint prettier format build bundle test vitest check run

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

BASENAME ::= $$(basename $${BUNDLE})
COMMAND ::= $$(jq .name < package.json -r | sed -e 's/^[^/]*\///')

install:
	@npm ci 2>&1 >/dev/null

eslint: install
	@npx eslint . --ext .ts

prettier: install
	@npx prettier --check .

lint: eslint prettier

format: install
	@npx prettier --write .

build: install bundle

clean:
	@rm -rf $$(dirname ${BUNDLE})

${BUNDLE}:
	@npx webpack --mode production

bundle: ${BUNDLE}
	@chmod +x $<
	@jq -s ".[0] * {\"bin\": { \"${COMMAND}\": \"${BASENAME}\"}}" package.json \
		> $$(dirname $<)/package.json

test: vitest check

vitest:
	@npx vitest run --passWithNoTests

check: ${BUNDLE}
	${BUNDLE} --version 2>&1 >/dev/null
	${BUNDLE} --help 2>&1 >/dev/null
	${BUNDLE} --help --verbose 2>&1 >/dev/null
	${BUNDLE} zone --help 2>&1 >/dev/null
	${BUNDLE} waf --help 2>&1 >/dev/null
	${BUNDLE} waf package --help 2>&1 >/dev/null
	${BUNDLE} waf package list --help 2>&1 >/dev/null
	${BUNDLE} waf package rules --help 2>&1 >/dev/null

run: build
	@${BUNDLE} $(filter-out run,$(MAKECMDGOALS))

%:
	@:
