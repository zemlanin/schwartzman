'use strict'

var mockery = require("mockery")
var semver = require("semver")
var assert = require("assert")
var mustache = require("mustache")
var schwartzman = require("../dist/schwartzman").bind({
  cacheble: function () {},
  query: '?{prelude: false, requireName: "../dist/schwartzman"}'
})

describe('plain-text renderer compatability', function () {
  var React, ReactDOMServer

  before(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false
    })

    if (process.env.REACT_VERSION) {
      mockery.registerMock('react', require('./peer/react-'+process.env.REACT_VERSION+'/lib/node_modules/react'));
      mockery.registerMock('react-dom', require('./peer/react-'+process.env.REACT_VERSION+'/lib/node_modules/react-dom'));
      mockery.registerMock('react-dom/server', require('./peer/react-'+process.env.REACT_VERSION+'/lib/node_modules/react-dom/server'));

      React = require('react')
      ReactDOMServer = require('react-dom/server')
    } else {
      React = require('react')
      ReactDOMServer = require('react-dom/server')
    }
  })

  after(function () {
    mockery.disable()
  })

  var templates = [
    "<div></div>",
    "<div>{{name}}</div>",
    "<div>{{#user}}{{name}}{{/user}}</div>",
    "<div>{{#user}}|{{name}}|{{/user}}</div>",
    "<ul>{{#user}}<li>{{name}}</li>{{/user}}</ul>",
    "<ul>{{#user}}<li>{{name}}</li>{{/user}}<i>{{name}}</i></ul>",
    "<b>{{^great}}Not terrible{{/great}}</b>",
    "<b>{{^great}}{{name}}{{/great}}</b>",
  ]

  var props = [
    {},
    { name: "Lorem" },
    { user: true, name: "Ipsum" },
    { user: { name: "Coda" } },
    { user: {}, name: "Frank" },
    { user: { x: 12 }, name: "Mac" },
    { user: { name: "Ivan" }, name: "Joey" },
    { user: { name: null }, name: "Charlie" },
    { user: [{ name: "Natalia" }, { name: "Irina" }], name: "Danny" },
    { user: [{ name: "Vasiliy" }, {}], name: null },
    { great: false },
    { great: true },
    { great: {} },
    { great: [] },
    { great: [], name: "Alex" },
    { great: true, name: "Alex" },
    { fn: 0, great: function _0() { return function () {} }},
    { fn: 1, user: function _1() { return function () {} }},
    { fn: 2, user: function _2() { return function () { return "ok" } }},
    { fn: 3, user: function _3() { return function (text, render) { return "<u>" + render(text) + "</u>" } }},
    { fn: 4, user: function _4() { return function (text, render) { return "<u>" + render(text) + "</u>" } }, name: "Andrew" },
  ]

  templates.forEach(function (tmpl) {
    var compiledTmpl = eval(schwartzman(tmpl))

    it("template: " + tmpl, function () {
      var propsAsString

      for (var i = 0; i < props.length; i++) {
        assert.equal(
          ReactDOMServer.renderToStaticMarkup(
            React.createElement(compiledTmpl, props[i])
          ),
          mustache.render(tmpl, props[i]),
          JSON.stringify(props[i])
        )
      }
    })
  })
})
