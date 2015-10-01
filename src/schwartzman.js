import assign from 'lodash.assign'
import {parse} from './grammar'

function compileAny(nodesTree, varVar) {
  if (nodesTree.html_tag || nodesTree.open_html_tag) {
    return compileDOM(nodesTree, varVar)
  } else {
    return compileMustache(nodesTree, varVar)
  }
}

function compileMustache(nodesTree, varVar) {}

function prerareStyle(styleString) {
  return styleString // TODO
}

function prepareAttr({name, value}) {
  var attrKey = name.text
  var attrValue = value.text

  switch (attrKey) {
    case 'class':
      attrKey = 'className'
    case 'style':
      attrValue = prerareStyle(attrValue)
  }
  return {[attrKey]: attrValue}
}

function compileDOM(nodesTree, varVar) {
  var currentNodeHTML = nodesTree
  var tagName
  var attrs
  var children

  if (
    nodesTree.nodes  // node with closing tag
    && nodesTree.open_html_tag.tag_name.text != nodesTree.close_html_tag.tag_name.text
  ) {
    let {open_html_tag: open, close_html_tag: close} = nodesTree
    throw new Error(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
  }

  if (nodesTree.open_html_tag) {
    tagName = nodesTree.open_html_tag.tag_name
    attrs = nodesTree.open_html_tag.attrs.elements
    children = nodesTree.nodes.elements
  } else {
    tagName = nodesTree.tag_name
    attrs = nodesTree.attrs.elements
  }

  tagName = tagName.text.trim()
  attrs = attrs.map(prepareAttr).reduce(assign, {})

  if (children && children.length) {
    return `
      React.DOM.${tagName}(
        ${JSON.stringify(attrs)},
        ${children.map(n => compileAny(n, varVar)).join(', ')}
      )
    `
  }

  return `React.DOM.${tagName}(${JSON.stringify(attrs)})`
}

const actions = {
  removeQuotes: (input, start, end, [lq, text, rq]) => text,
}

module.exports = function(content) {
  this.cacheable();
  return `
    'use strict'
    // compiled with schwartzman
    var React = require('react')

    module.exports = function (p) {
      return (${compileDOM(parse(content, {actions}), 'p')})
    }
  `
};
