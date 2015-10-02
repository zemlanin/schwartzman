bin = $(shell npm bin)
babel = $(bin)/babel
webpack = $(bin)/webpack
canopy = $(bin)/canopy

bin/schwartzman.js: src/schwartzman.js bin/grammar.js
	mkdir -p $(dir $@)
	$(babel) src/schwartzman.js > $@

bin/grammar.js: src/grammar.peg
	$(canopy) src/grammar.peg --lang js
	mv src/grammar.js bin

.PHONE: examples
examples: examples/src/*/* bin/schwartzman.js
	$(webpack)
	node examples/out/try.js
