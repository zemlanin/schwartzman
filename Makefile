bin = $(shell npm bin)
babel = $(bin)/babel
webpack = $(bin)/webpack
canopy = $(bin)/canopy
mocha = $(bin)/mocha

dist/schwartzman.js: src/schwartzman.js dist/grammar.js
	$(babel) src/schwartzman.js > $@

dist/grammar.js: src/grammar.peg
	$(canopy) src/grammar.peg --lang js
	mv src/grammar.js dist

.PHONY: examples
examples: examples/src/*/* dist/schwartzman.js
	$(webpack)
	node examples/out/try.js

.PHONY: test
test: dist/schwartzman.js
	$(mocha)
