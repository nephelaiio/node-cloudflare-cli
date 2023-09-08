.PHONY: install lint eslint prettier format build webpack test vitest check run

ifneq (,$(wildcard ./.env))
    include .env
    export
endif

install:
	@npm ci 2>&1 >/dev/null

eslint: install
	@npx eslint . --ext .ts

prettier: install
	@npx prettier --check .

lint: eslint prettier

format: install
	@npx prettier --write .

build: install ${BUNDLE}

clean:
	@rm -rf $$(dirname ${BUNDLE})

webpack: clean ${BUNDLE}

${BUNDLE}:
	npx webpack --mode production
	cp package.json $$(dirname $@)

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
