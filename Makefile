.PHONY: install lint eslint prettier format build webpack test vitest check run

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

BASENAME ::= $$(basename $${BUNDLE})

install:
	@npm ci 2>&1 >/dev/null

eslint: install
	@npx eslint . --ext .ts

prettier: install
	@npx prettier --check .

lint: eslint prettier

format: install
	@npx prettier --write .

build: install package

clean:
	@rm -rf $$(dirname ${BUNDLE})

webpack: clean package

${BUNDLE}:
	npx webpack --mode production

package: ${BUNDLE}
	jq -s ".[0] * {\"bin\": { \"cli\": \"${BASENAME}\"}}" package.json > $$(dirname $<)/package.json

test: vitest check

vitest:
	@npx vitest run --passWithNoTests

check: ${BUNDLE}
	${BUNDLE} --version 2>&1 >/dev/null
	${BUNDLE} --help 2>&1 >/dev/null
	${BUNDLE} --help --verbose 2>&1 >/dev/null
	${BUNDLE} zone --help 2>&1 >/dev/null

run: build
	@${BUNDLE} $(filter-out run,$(MAKECMDGOALS))

%:
	@:
