'use strict'

var assert = require("assert")
var LL = require("../dist/schwartzman").lowLevel

function parse(tmpl) {
  return LL.PEGparse(tmpl, {actions: LL.PEGactions, types: LL.PEGtypes})
}

function parseAndCompile(tmpl, v) {
  return LL.compileDOM(parse(tmpl), v).code.replace(/\s*$/, '')
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

    it('correctly prepare name-only attrs', function () {
      assert.deepEqual(
        LL.compileAttrs('props', '', {
          name: {text: 'x'}
        }),
        '"x":true'
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

  describe('compileAttrs mustache', function () {
    xit('correctly prepare ordinary attrs', function () {
      assert.deepEqual(
        LL.compileAttrs('props', '', {
          name: {text: 'x'},
          value: {text: 'x'},
          _type: 'MustacheNode'
        }),
        '"x":"x"'
      )
    })
  })

  describe('parse', function () {
    it('syntax errors: dom tree', function () {
      assert.throws(parse.bind(null, "<p><b></p></b>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p><img></p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p><</p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p>></p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p %></p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p>"), /SyntaxError/)
    })

    it('syntax errors: "single escaped child" limitation', function () {
      assert.throws(parse.bind(null, "<p>{{{ one }}}{{{ two }}}</p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p>{{& one }}{{{ two }}}</p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p>{{{ one }}}{{& two }}</p>"), /SyntaxError/)
      assert.throws(parse.bind(null, "<p>{{{ one }}}text</p>"), /SyntaxError/)
    })

    it('mustache: multicase vars', function () {
      assert.doesNotThrow(parse.bind(null, "<p>{{{ one }}}</p>"))
      assert.doesNotThrow(parse.bind(null, "<p>{{{ ONE }}}</p>"))
      assert.doesNotThrow(parse.bind(null, "<p>{{{ oNe }}}</p>"))
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
        parseAndCompile("<p>lol</p>", {varName: 'props'}).replace(/\s+/g, ''),
        'React.DOM.p(null,"lol")'
      )
    })

    it('compiles single node with multiple attrs', function () {
      assert.equal(
        parseAndCompile("<div data-x='x' data-y='y'></div>"),
        'React.DOM.div({"data-x":"x","data-y":"y"})'
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
        parseAndCompile("<p>{{lol}}</p>", {varName: 'props'}).replace(/\s+/g, ''),
        'React.DOM.p(null,props.lol)'
      )
    })

    it('compiles variable node as attr value', function () {
      assert.equal(
        parseAndCompile("<p lol={{lol}}></p>", {varName: 'props'}).replace(/\s+/g, ''),
        'React.DOM.p({"lol":props.lol})'
      )
    })

    it('compiles variable node inside attr value', function () {
      assert.equal(
        parseAndCompile('<p lol="test {{lol}}"></p>', {varName: 'props'}).replace(/\s+/g, ''),
        'React.DOM.p({"lol":"test"+props.lol})' // loses space because of replace inside a test
      )
    })

    it('compiles section node with text inside', function () {
      assert.equal(
        parseAndCompile('<p>{{#people}}x{{/people}}</p>', {varName: 'props'}).replace(/\s+/g, ''),
        'React.DOM.p(null,section(props,"people",function(people){return("x")}))'
      )
    })

    it('compiles section node with mustache inside', function () {
      assert.equal(
        parseAndCompile('<span>{{#people}}{{name}},{{/people}}</span>', {varName: 'props'}).replace(/\s+/g, ''),
        'React.DOM.span(null,section(props,"people",function(people){return[people.name,","]}))'
      )
    })

    it('compiles section node with dom inside', function () {
      assert.equal(
        parseAndCompile('<ul>{{#people}}<li>{{name}}</li>{{/people}}</ul>', {varName: 'props'}).replace(/\s+/g, ''),
        'React.DOM.ul(null,section(props,"people",function(people){return(React.DOM.li(null,people.name))}))'
      )
    })

    it('compiles inverted section node with text inside', function () {
      assert.equal(
        parseAndCompile('<p>{{^people}}x{{/people}}</p>', {varName: 'props'}).replace(/\s+/g, ''),
        'React.DOM.p(null,inverted_section(props,"people",function(){return("x")}))'
      )
    })

    it('compiles comment node', function () {
      assert.equal(
        parseAndCompile('<p>lol{{! comment }}</p>', {varName: 'props'}).replace(/ +/g, '').replace(/\n\n+/g, '\n'),
        'React.DOM.p(\n'+
        'null\n'+
        ',"lol"//comment\n'+
        ')'
      )
    })

    it('compiles escaped node', function () {
      assert.equal(
        parseAndCompile('<p>{{{ amp }}}</p>', {varName: 'props'}).replace(/ +/g, ''),
        'React.DOM.p({"dangerouslySetInnerHTML":{"__html":props.amp}})'
      )

      assert.equal(
        parseAndCompile('<p>{{& amp }}</p>', {varName: 'props'}).replace(/ +/g, ''),
        'React.DOM.p({"dangerouslySetInnerHTML":{"__html":props.amp}})'
      )
    })
  })
})
