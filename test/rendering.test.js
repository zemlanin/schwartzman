'use strict'

var mockery = require("mockery")
var semver = require("semver")
var assert = require("assert")
var schwartzman = require("../dist/schwartzman").bind({
  cacheble: function () {},
  query: process.env.ENABLE_LAMBDAS ? '?{lambdas: true}' : ''
})

describe('rendering', function () {
  var React, ReactDOMServer
  if (process.env.REACT_VERSION) {
    before(function () {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false
      })

      var peerReact = require('./peer/react-'+process.env.REACT_VERSION+'/lib/node_modules/react')
      var peerReactDOM = require('./peer/react-'+process.env.REACT_VERSION+'/lib/node_modules/react-dom')
      var peerReactDOMServer = require('./peer/react-'+process.env.REACT_VERSION+'/lib/node_modules/react-dom/server')

      mockery.registerMock('react', peerReact);
      mockery.registerMock('react-dom', peerReactDOM);
      mockery.registerMock('react-dom/server', peerReactDOMServer);

      React = require('react')
      ReactDOMServer = require('react-dom/server')
    })

    after(function () {
      mockery.disable()
    })
  } else {
    React = require('react')
    ReactDOMServer = require('react-dom/server')
  }

  it('classnames without commas', function () {
    var tmpl = eval(schwartzman(
      '<div class="x {{#suffix}}c_{{suffix}}{{/suffix}}">classes should be equal "x c_x"</div>'
    ))
    var tmpl2 = eval(schwartzman(
      '<div class="x {{^suffix}}{{prefix}}_c{{/suffix}}">classes should be equal "x x_c"</div>'
    ))

    assert.equal(
      '<div class="x c_x">classes should be equal &quot;x c_x&quot;</div>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {suffix: 'x'})
      )
    )
    assert.equal(
      '<div class="x x_c">classes should be equal &quot;x x_c&quot;</div>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl2, {prefix: 'x'})
      )
    )
  })

  it('correct scope search: outer', function () {
    var tmpl = eval(schwartzman(`
      <div>
        {{#name}}
          <b class=x>
            {{name}}
          </b>
        {{/name}}
        {{#wrapper}}@@{{name}}@@{{/wrapper}}
      </div>
    `))

    assert.equal(
      '<div><b class="x">Jason</b></div>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {name: 'Jason', wrapper: false})
      )
    )
  })

  it('correct scope search: inner', function () {
    var tmpl = eval(schwartzman(`
      <div>
        {{#obj}}
          {{#i}}
          +++{{i}}+++
          {{/i}}

          {{^k}}
          ~~~{{i}}~~~
          {{/k}}
          ---{{k}}---
          ==={{name}}===
        {{/obj}}
      </div>
    `))

    assert.equal(
      `<div>+++42+++
        ~~~42~~~
        ------
        ===Jason===
      </div>`.replace(/^\s{2,}/gm, '  '),
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {name: 'Jason', obj: {i: 42}})
      ).replace(/^\s{2,}/gm, '  ')
    )
  })

  describe('section', function () {
    var tmpl = eval(schwartzman(
      `<div>{{# user }}[{{ name }}]{{/ user }}({{ name }})</div>`
    ));

    it('if', function () {
      assert.equal(
        '<div>[Anatoly Dyatlov](Anatoly Dyatlov)</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            {user: true, name: 'Anatoly Dyatlov'}
          )
        )
      )

      assert.equal(
        '<div>(Anatoly Dyatlov)</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            {user: false, name: 'Anatoly Dyatlov'}
          )
        )
      )

      assert.equal(
        '<div>()</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            { user: false, name: null }
          )
        )
      )

      assert.equal(
        '<div>[]()</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            { user: function someFunc() { return function () {} } }
          )
        )
      )

      assert.equal(
        '<div>(Anatoly Dyatlov)</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            {name: 'Anatoly Dyatlov'}
          )
        )
      )
    })

    it('scope', function () {
      assert.equal(
        '<div>[Anatoly Dyatlov](Ulana Khomyuk)</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            { user: { name: 'Anatoly Dyatlov'}, name: 'Ulana Khomyuk' }
          )
        )
      )

      assert.equal(
        '<div>[]()</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            {user: {}}
          )
        )
      )

      assert.equal(
        '<div>[Ulana Khomyuk](Ulana Khomyuk)</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            { user: {}, name: 'Ulana Khomyuk' }
          )
        )
      )

      assert.equal(
        '<div>[](Ulana Khomyuk)</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            { user: { name: null }, name: 'Ulana Khomyuk' }
          )
        )
      )
    })

    it('for_each', function () {
      assert.equal(
        '<div>[Anatoly Dyatlov][Ulana Khomyuk]()</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            { user: [{ name: 'Anatoly Dyatlov'}, {name: 'Ulana Khomyuk'}] }
          )
        )
      )

      assert.equal(
        '<div>()</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            {user: []}
          )
        )
      )

      assert.equal(
        '<div>[][]()</div>',
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(
            tmpl,
            { user: [{}, {}] }
          )
        )
      )
    })
  })

  it('comments', function () {
    var tmpl = eval(schwartzman(`
      <div>
        <!--<b></b>-->
        <i></i>
        <!--<b></b>-->
        <i></i>
        <!--<b></b>-->
      </div>
    `))

    assert.equal(
      `<div><i></i><i></i></div>`,
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {})
      )
    )
  })

  it('arrays', function () {
    var tmpl = eval(schwartzman(`
      <div>
        <ul>
          {{#people}}
            <li key={{name}}>{{name}}</li>
          {{/people}}
        </ul>
        <span>
          {{#people}}la {{/people}}
        </span>
        {{^people}}<span>no people</span>{{/people}}
        {{^animals}}<span>no animals</span>{{/animals}}
      </div>
    `))

    assert.equal(
      `<div><ul><li>Alice</li><li>Bob</li></ul><span>la la </span><span>no animals</span></div>`,
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {people: [
          {name: 'Alice'},
          {name: 'Bob'},
        ]})
      )
    )
  })

  it('escaping', function () {
    var tmpl = eval(schwartzman(`
      <div>
        <b>{{{ noEscape }}}</b>
        <b>{{{ amp }}}</b>
      </div>
    `))

    assert.equal(
      `<div><b><i>lol</i></b><b>&amp;</b></div>`,
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {
          noEscape: '<i>lol</i>',
          amp: '&amp;',
        })
      )
    )
  })

  it('attributes', function () {
    var tmpl = eval(schwartzman(`
      <div>
          <b checked>{{{ amp }}}</b>
          <div class={{#amp}}lol{{/amp}} />
          <div {{#amp}}checked{{/amp}} />
          <i style="text-decoration: underline">underlined</i>
      </div>
    `))

    var rendered

    if (semver.gte(React.version, '16.0.0')) {
      rendered = `<div><b checked="">&amp;</b><div class="lol"></div><div checked=""></div><i style="text-decoration:underline">underlined</i></div>`
    } else {
      rendered = `<div><b checked="">&amp;</b><div class="lol"></div><div checked=""></div><i style="text-decoration:underline;">underlined</i></div>`
    }

    assert.equal(
      rendered,
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {
          amp: '&amp;',
        })
      )
    )
  })

  it('multiple styles', function () {
    var tmpl = eval(schwartzman(`
      <div style="text-decoration: underline; color: red;">red underlined</div>
    `))

    var rendered

    if (semver.gte(React.version, '16.0.0')) {
      rendered = `<div style="text-decoration:underline;color:red">red underlined</div>`
    } else {
      rendered = `<div style="text-decoration:underline;color:red;">red underlined</div>`
    }

    assert.equal(
      rendered,
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {})
      )
    )
  })

  it('classnames without nulls', function () {
    var tmpl = eval(schwartzman(
      '<span class="x{{^ y }} y{{/ y }}">class should be "x"</span>'
    ))
    var tmpl2 = eval(schwartzman(
      '<span class="x{{# y }} y{{/ y }}">class still should be "x"</span>'
    ))

    assert.equal(
      '<span class="x">class should be &quot;x&quot;</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {y: true})
      )
    )
    assert.equal(
      '<span class="x">class still should be &quot;x&quot;</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl2, {y: false})
      )
    )
  })

  it('valueless attributes', function () {
    var tmpl = eval(schwartzman(
      '<span {{# y }}hidden{{/ y }}>hidden should be falsey</span>'
    ))
    var tmpl2 = eval(schwartzman(
      '<span {{# y }}hidden{{/ y }}>hidden should be truthy</span>'
    ))

    assert.equal(
      '<span>hidden should be falsey</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {y: false})
      )
    )
    assert.equal(
      '<span hidden="">hidden should be truthy</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl2, {y: true})
      )
    )
  })

  it('naked attribute values', function () {
    var tmpl = eval(schwartzman(
      '<span id=a>id\'d</span>'
    ))

    assert.equal(
      '<span id="a">id&#x27;d</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl)
      )
    )
  })

  it('computed style', function () {
    var tmpl = eval(schwartzman(
      '<span style={{sm}}>should have small font-size</span>'
    ))

    var styleEndsWithoutSemicolon = semver.gte(React.version, '16.0.0')

    assert.equal(
      styleEndsWithoutSemicolon
        ? '<span style="font-size:10px">should have small font-size</span>'
        : '<span style="font-size:10px;">should have small font-size</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {sm: "font-size: 10px"})
      )
    )

    assert.equal(
      styleEndsWithoutSemicolon
        ? '<span style="font-size:5%">should have small font-size</span>'
        : '<span style="font-size:5%;">should have small font-size</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {sm: "font-size: 5%"})
      )
    )

    var tmpl2 = eval(schwartzman(
      '<span style="{{sm}}; color: red">should have small font-size</span>'
    ))

    assert.equal(
      styleEndsWithoutSemicolon
        ? '<span style="font-size:10px;color:red">should have small font-size</span>'
        : '<span style="font-size:10px;color:red;">should have small font-size</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl2, {sm: "font-size: 10px"})
      )
    )

    assert.equal(
      styleEndsWithoutSemicolon
        ? '<span style="color:red">should have small font-size</span>'
        : '<span style="color:red;">should have small font-size</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl2, {sm: ""})
      )
    )
  })

  it('curlybraces', function () {
    assert.equal(
      '<span>}</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span>}</span>')))
      )
    )

    assert.equal(
      '<span>}}</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span>}}</span>')))
      )
    )

    assert.equal(
      '<span>{}}</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span>{}}</span>')))
      )
    )

    assert.throws(function () { schwartzman('<span>{{</span>') }, /SyntaxError/)
  })

  it('escaping curlybraces', function () {
    assert.equal(
      '<span>{{</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span>{\\{</span>')))
      )
    )

    assert.equal(
      '<span>{\\{</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span>{\\\\{</span>')))
      )
    )

    assert.equal(
      '<span>Jason</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span>{{name}}</span>')), {name: "Jason"})
      )
    )

    assert.equal(
      '<span>{{name}}</span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span>{\\{name}}</span>')), {name: "Jason"})
      )
    )

    assert.equal(
      '<span></span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span>{{! }\\} }}</span>')))
      )
    )

    assert.equal(
      '<span id="{{}}"></span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span id="{\\{}}"></span>')))
      )
    )

    assert.equal(
      '<span id="{{}}"></span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span id={\\{}}></span>')))
      )
    )

    assert.throws(function () { schwartzman('<span>{{}\\}</span>') }, /SyntaxError/)
    assert.throws(function () { schwartzman('<span>{{name}\\}</span>') }, /SyntaxError/)
  })

  it('escaping attributes', function () {
    assert.equal(
      '<span id="&#x27;"></span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span id="\'"></span>')))
      )
    )

    assert.equal(
      '<span id="&quot;"></span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman('<span id="\\""></span>')))
      )
    )

    assert.equal(
      '<span id="&#x27;"></span>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(eval(schwartzman("<span id='\\''></span>")))
      )
    )
  })
})
