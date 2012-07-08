test:
	@mocha \
		--reporter list

clean:
	@rm -rf lib
	@mkdir lib

build:
	@mkdir -p lib
	@coffee -j lib/Backbone.Regrettable.js -o lib -c src/regrettable.coffee

.PHONY: clean build test
