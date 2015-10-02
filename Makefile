bin = $(shell npm bin)
babel = $(bin)/babel
webpack = $(bin)/webpack
canopy = $(bin)/canopy

dist/schwartzman.js: src/schwartzman.js dist/grammar.js
	$(babel) src/schwartzman.js > $@

dist/grammar.js: src/grammar.peg
	$(canopy) src/grammar.peg --lang js
	mv src/grammar.js dist

.PHONE: examples
examples: examples/src/*/* dist/schwartzman.js
	$(webpack)
	node examples/out/try.js
