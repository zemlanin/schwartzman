'use strict'

var assert = require("assert")
var LL = require("../dist/schwartzman").lowLevel

function parse(tmpl) {
  return LL.PEGparse(tmpl, {actions: LL.PEGactions, types: LL.PEGtypes})
}

function parseAndCompile(tmpl, v) {
  return LL.compileDOM(parse(tmpl), v)
}

describe('schwartzman', function() {
  describe('prepareAttr', function () {
    it('empty arg returns an object', function () {
      assert.deepEqual(LL.prepareAttr({}), {})
    })

    it('correctly prepare ordinary attrs', function () {
      assert.deepEqual(
        LL.prepareAttr({
          name: {text: 'x'},
          value: {text: 'x'}
        }),
        {x: 'x'}
      )
    })

    it('correctly prepare `class` attr', function () {
      assert.deepEqual(
        LL.prepareAttr({
          name: {text: 'class'},
          value: {text: 'x'}
        }),
        {className: 'x'}
      )
    })

    it('correctly prepare `style` attr', function () {
      assert.deepEqual(
        LL.prepareAttr({
          name: {text: 'style'},
          value: {text: 'width: "200px"'}
        }),
        {style: 'width: "200px"'}
      )
    })
  })

  describe('compileDOM', function () {
    it('compiles single simple node', function () {
      assert.deepEqual(
        parseAndCompile("<div></div>"),
        'React.DOM.div({})'
      )

      assert.deepEqual(
        parseAndCompile("<img src='test.jpg'></img>"),
        'React.DOM.img({"src":"test.jpg"})'
      )

      assert.deepEqual(
        parseAndCompile("<span hidden=hidden></span>"),
        'React.DOM.span({"hidden":"hidden"})'
      )

      assert.deepEqual(
        parseAndCompile('<span class="hidden"></span>'),
        'React.DOM.span({"className":"hidden"})'
      )

      assert.deepEqual(
        parseAndCompile("<p>lol</p>", 'props').replace(/\s+/g, ''),
        'React.DOM.p({},"lol")'
      )
    })
  })

  describe('compileMustache', function () {
    it('compiles variable node', function () {
      assert.deepEqual(
        parseAndCompile("<p>{{lol}}</p>", 'props').replace(/\s+/g, ''),
        'React.DOM.p({},props.lol)'
      )
    })
  })

  describe('syntax errors', function () {
    it('dom', function () {
      assert.throws(parse.bind(null, "<p><b></p></b>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p><img></p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p><</p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p>></p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p %></p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p>"), /SyntaxError/)
    })
  })
})
