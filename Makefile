ONLY = "."

test:
	@NODE_ENV=testing ./node_modules/.bin/mocha \
	test.js --timeout 100 -g $(ONLY) --reporter spec

