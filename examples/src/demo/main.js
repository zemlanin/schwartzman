import React from 'react'
import _range from 'lodash.range'
import Mustache from 'mustache'
import ReactDOM from 'react-dom'
import tmpl from './tmpl.jsx.mustache'

var Component = React.createClass({
  render: function () {
    return tmpl(this.props)
  }
})

var debug = (raw, render) => {
  // console.time("wrapper")
  const result = React.createElement(
    "div",
    {onMouseEnter: () => document.getElementById("debug").innerText = raw},
    render(raw)
  )
  // console.timeEnd("wrapper")
  return result
}

// var Component = tmpl

var lastPhotoId = 5

function generateResponse() {
  return (
    _range(lastPhotoId)
    .map(id => ({
      id,
      name: "product number " + id,
      src: "http://lorempixel.com/100/100/?i=" + id,
    }))
  )
}

function render() {
  ReactDOM.render(
    React.createElement(Component, {
      images: generateResponse(),
      debug: debug,
    }),
    document.getElementById("rendered")
  )
}

document.getElementById("rendered").innerHTML = Mustache.render(tmpl.raw, {
  images: generateResponse(),
  debug: true,
}).replace(/>\s+/g, '>')

document.getElementById("hook").onclick = function (e) { render() }

document.getElementById("more").onclick = function (e) {
  lastPhotoId += 5

  render()
}
