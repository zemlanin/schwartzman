'use strict'

var assert = require("assert")
var LL = require("../dist/schwartzman").lowLevel

function parse(tmpl) {
  return LL.PEGparse(tmpl, {actions: LL.PEGactions, types: LL.PEGtypes})
}

function parseAndCompile(tmpl, v) {
  return LL.compileDOM(parse(tmpl), v).replace(/\s*$/, '')
}

describe('schwartzman', function() {
  describe('compileAttrs', function () {
    it('empty arg returns an object', function () {
      assert.deepEqual(LL.compileAttrs('props', '', {}), '')
    })

    it('correctly prepare ordinary attrs', function () {
      assert.deepEqual(
        LL.compileAttrs('props', '', {
          name: {text: 'x'},
          value: {text: 'x'}
        }),
        '"x":"x"'
      )
    })

    it('correctly prepare `class` attr', function () {
      assert.deepEqual(
        LL.compileAttrs('props', '', {
          name: {text: 'class'},
          value: {text: 'x'}
        }),
        '"className":"x"'
      )
    })

    it('correctly prepare `style` attr', function () {
      assert.deepEqual(
        LL.compileAttrs('props', '', {
          name: {text: 'style'},
          value: {text: 'width: "200px"'}
        }),
        '"style":"width: \\"200px\\""'
      )
    })
  })

  describe('compileDOM', function () {
    it('compiles single simple node', function () {
      assert.equal(
        parseAndCompile("<div></div>"),
        'React.DOM.div(null)'
      )

      assert.equal(
        parseAndCompile("<textarea/>"),
        'React.DOM.textarea(null)'
      )

      assert.equal(
        parseAndCompile("<img src='test.jpg'></img>"),
        'React.DOM.img({"src":"test.jpg"})'
      )

      assert.equal(
        parseAndCompile("<span hidden=hidden></span>"),
        'React.DOM.span({"hidden":"hidden"})'
      )

      assert.equal(
        parseAndCompile('<span class="hidden"></span>'),
        'React.DOM.span({"className":"hidden"})'
      )

      assert.equal(
        parseAndCompile("<p>lol</p>", 'props').replace(/\s+/g, ''),
        'React.DOM.p(null,"lol")'
      )
    })

    it('compiles nested nodes', function () {
      assert.equal(
        parseAndCompile("<div><img/></div>").replace(/\s+/g, ''),
        'React.DOM.div(null,React.DOM.img(null))'
      )

      assert.equal(
        parseAndCompile("<div><img/><img/></div>").replace(/\s+/g, ''),
        'React.DOM.div(null,React.DOM.img(null),React.DOM.img(null))'
      )

      assert.equal(
        parseAndCompile("<p>lol<img/></p>").replace(/\s+/g, ''),
        'React.DOM.p(null,"lol",React.DOM.img(null))'
      )

      assert.equal(
        parseAndCompile("<div><p><img/></p></div>").replace(/\s+/g, ''),
        'React.DOM.div(null,React.DOM.p(null,React.DOM.img(null)))'
      )
    })
  })

  describe('compileMustache', function () {
    it('compiles variable node', function () {
      assert.equal(
        parseAndCompile("<p>{{lol}}</p>", 'props').replace(/\s+/g, ''),
        'React.DOM.p(null,props.lol)'
      )
    })

    it('compiles variable node as attr value', function () {
      assert.equal(
        parseAndCompile("<p lol={{lol}}></p>", 'props').replace(/\s+/g, ''),
        'React.DOM.p({"lol":props.lol})'
      )
    })

    it('compiles variable node inside attr value', function () {
      assert.equal(
        parseAndCompile('<p lol="test {{lol}}"></p>', 'props').replace(/\s+/g, ''),
        'React.DOM.p({"lol":"test"+props.lol})' // loses space because of replace inside a test
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
