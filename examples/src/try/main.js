import React from 'react'
import ReactDOM from 'react-dom/server'
import tmpl from './tmpl.jsx.mustache'

var Component = React.createClass({
  render: function() {
    return tmpl(this.props)
  }
})

var element = React.createElement(Component, {
  name: 'Jason',
  people: [
    {name: 'Alice'},
    {name: 'Bob'},
  ],
  wrapper: function (raw, render) { return render(raw) },
  noEscape: '<i>lol</i>',
  amp: '&amp;',
  obj: {i: 42},
})

console.log(ReactDOM.renderToStaticMarkup(element), '\n\n')
console.log(ReactDOM.renderToString(element))
