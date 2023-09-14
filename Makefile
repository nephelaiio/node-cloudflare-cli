.PHONY: install lint eslint prettier format build bundle test check run

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

VERSION ::= $$(jq .version < package.json -r)
BASENAME ::= $$(basename $${BUNDLE})
COMMAND ::= $$(jq .name < package.json -r | sed -e 's/^[^/]*\///')

install:
	@bun install

eslint: install
	@bunx eslint . --ext .ts

prettier: install
	@bunx prettier --check .

lint: eslint prettier

format: install
	@bunx prettier --write .

build: install bundle

clean:
	@rm -rf $$(dirname ${BUNDLE})

${BUNDLE}:
	bun build ${SOURCE} \
		--outfile=${BUNDLE} \
		--target=node \
		--external=commander \
		--external==dotenv \
		--define __VERSION__:${VERSION} \
		--external "@nephelaiio/cloudflare-api" \
		--external "@nephelaiio/logger"

bundle: ${BUNDLE}
	@jq -s ".[0] * {\"bin\": { \"${COMMAND}\": \"${BASENAME}\"}}" package.json \
		> $$(dirname $<)/package.json

test: check unit

unit:
	bun test

check: ${BUNDLE}
	make run -- --version 2>&1 >/dev/null
	make run -- --help 2>&1 >/dev/null
	make run -- --help --verbose 2>&1 >/dev/null
	make run -- zone --help 2>&1 >/dev/null
	make run -- waf --help 2>&1 >/dev/null
	make run -- waf package --help 2>&1 >/dev/null
	make run -- waf package list --help 2>&1 >/dev/null
	make run -- waf package rules --help 2>&1 >/dev/null

run:
	node ${BUNDLE} $(filter-out run,$(MAKECMDGOALS))

%:
	@:
