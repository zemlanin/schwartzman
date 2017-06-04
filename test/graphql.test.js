'use strict'

var assert = require("assert")
var schwartzman = require("../dist/schwartzman").bind({
  cacheble: function () {},
  query: process.env.ENABLE_LAMBDAS ? '?{lambdas: true}' : ''
})
var LL = require("../dist/schwartzman").lowLevel

function parse(tmpl) {
  return LL.PEGparse(tmpl, {actions: LL.PEGactions, types: LL.PEGtypes})
}

function parseAndCompileStructure(tmpl, v) {
  v = v || {}
  if (v.__plainScopeNames == undefined) {
    v.__plainScopeNames = true
  }
  return LL.compileAny(parse(tmpl).elements[0], v).structure
}

describe('graphql', function() {
  describe('compileAny().structure', function () {
    it('one', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div></div>"),
        undefined
      )
    })

    it('two', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{x}}</div>"),
        {
          '+x': undefined
        }
      )
    })

    it('two two', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{x}}{{y}}</div>"),
        {
          '+x': undefined,
          '+y': undefined
        }
      )
    })

    it('two three', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{x}}<i>{{y}}</i></div>"),
        {
          '+x': undefined,
          '+y': undefined
        }
      )
    })

    it('three', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{#x}}{{y}}{{/x}}</div>"),
        {
          '+x': {
            '?y': undefined
          },
          '?y': undefined
        }
      )
    })

    it('dots', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{#x.y}}{{z}}{{/x.y}}</div>"),
        {
          '+x': {
            '+y': {
              '?z': undefined
            }
          },
          '?z': undefined
        }
      )
    })

    it('another dots', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{x.y}}</div>"),
        {
          '+x': {
            '+y': undefined
          }
        }
      )
    })

    it('anotherer dots', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{#x.y}}{{z.i}}{{/x.y}}</div>"),
        {
          '+x': {
            '+y': {
              '?z': {
                '+i': undefined
              }
            }
          },
          '?z': {
            '+i': undefined
          }
        }
      )
    })

    it('anothererer dots', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{#x.y}}{{#z.i}}a{{/z.i}}{{/x.y}}</div>"),
        {
          '+x': {
            '+y': {
              '?z': {
                '+i': undefined
              }
            }
          },
          '?z': {
            '+i': undefined
          }
        }
      )
    })

    it('inverted dots', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{^x.y}}a{{/x.y}}</div>"),
        {
          '+x': {
            '+y': undefined
          }
        }
      )
    })

    it('inverted dots 2', function () {
      assert.deepEqual(
        parseAndCompileStructure("<div>{{^x.y}}{{z.i}}{{/x.y}}</div>"),
        {
          '+x': {
            '+y': undefined
          },
          '+z': {
            '+i': undefined
          }
        }
      )
    })
  })
})
