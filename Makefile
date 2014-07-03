ONLY = "."

test:
  @NODE_ENV=testing ./node_modules/.bin/mocha \
  test.js --timeout 50 -g $(ONLY) --reporter spec

 .PHONY: test
