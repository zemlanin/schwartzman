import React from 'react'
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
  'wrapper': function(props, fn){ return fn(props) },
})

console.log(React.renderToStaticMarkup(element), '\n\n')
console.log(React.renderToString(element))
