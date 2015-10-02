'use strict'

var assert = require("assert")
var LL = require("../dist/schwartzman").lowLevel

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
    it('compiles single node', function () {
      assert.deepEqual(
        LL.compileDOM(LL.PEGparse(
          "<div></div>"
        )),
        "React.DOM.div({})"
      )

      assert.deepEqual(
        LL.compileDOM(LL.PEGparse(
          "<img src='test.jpg'></img>",
          {actions: LL.PEGactions}
        )),
        'React.DOM.img({"src":"test.jpg"})'
      )

      assert.deepEqual(
        LL.compileDOM(LL.PEGparse(
          "<span hidden=hidden></span>",
          {actions: LL.PEGactions}
        )),
        'React.DOM.span({"hidden":"hidden"})'
      )

      assert.deepEqual(
        LL.compileDOM(LL.PEGparse(
          '<span class="hidden"></span>',
          {actions: LL.PEGactions}
        )),
        'React.DOM.span({"className":"hidden"})'
      )

      // assert.deepEqual(
      //   LL.compileDOM(LL.PEGparse(
      //     "<p>lol</p>",
      //     {actions: LL.PEGactions}
      //   )),
      //   'React.DOM.p({},"lol")'
      // )
    })
  })
})
