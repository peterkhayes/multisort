ONLY = "."

test:
	@NODE_ENV=testing ./node_modules/.bin/mocha \
	test.js --timeout 1000 -g $(ONLY)

