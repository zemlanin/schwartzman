'use strict'

var React = require("react")
var ReactDOMServer = require("react-dom/server")
var assert = require("assert")
var schwartzman = require("../dist/schwartzman").bind({cacheble: function () {}})

describe('rendering', function () {
  it('classnames without commas', function () {
    var tmpl = eval(schwartzman(
      '<div class="x {{#suffix}}c_{{suffix}}{{/suffix}}">classes should be equal "x c_x"</div>'
    ))

    assert.equal(
      '<div class="x c_x">classes should be equal &quot;x c_x&quot;</div>',
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {suffix: 'x'})
      )
    )
  })
})
