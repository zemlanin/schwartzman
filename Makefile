bin = $(shell npm bin)
babel = $(bin)/babel
webpack = $(bin)/webpack

bin/schwartzman.js: src/schwartzman.js
	$(babel) src/schwartzman.js > $@

.PHONE: examples
examples: examples/src/*/* bin/schwartzman.js
	$(webpack)
	node examples/out/try.js
