'use strict'

var mockery = require("mockery")
var semver = require("semver")
var assert = require("assert")
var mustache = require("mustache")
var schwartzman = require("../dist/schwartzman").bind({
  cacheble: function () {},
  query: process.env.ENABLE_LAMBDAS ? '?{lambdas: true}' : ''
})

describe('plain-text renderer compatability', function () {
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

  var templates = [
    "<div></div>",
    "<div>{{name}}</div>",
    "<div>{{#user}}{{name}}{{/user}}</div>",
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
