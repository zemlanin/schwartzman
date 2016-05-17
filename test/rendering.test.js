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
            <li>{{name}}</li>
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

    assert.equal(
      `<div><b checked="">&amp;</b><div class="lol"></div><div checked=""></div><i style="text-decoration:underline;">underlined</i></div>`,
      ReactDOMServer.renderToStaticMarkup(
        React.createElement(tmpl, {
          amp: '&amp;',
        })
      )
    )
  })
})
