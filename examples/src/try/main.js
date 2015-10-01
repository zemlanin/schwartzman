import React from 'react'
import tmpl from './tmpl.jsx.mustache'

var Component = React.createClass({
  render: function() {
    return tmpl(this.props)
  }
})

var element = React.createElement(Component, {
  name: 'Jason',
})

console.log(React.renderToStaticMarkup(element))
