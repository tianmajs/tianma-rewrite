TESTS = test/*.test.js
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS =

install:
	@tnpm install

jshint: install
	@./node_modules/.bin/jshint .

test: install
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--harmony \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require co-mocha \
		$(MOCHA_OPTS) \
		$(TESTS)

contributors: install
	@./node_modules/.bin/ali-contributors

.PHONY: test

