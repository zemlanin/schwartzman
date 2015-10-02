import assign from 'lodash.assign'
import {parse} from './grammar'

function compileAny(nodesTree, varVar) {
  switch (nodesTree._type) {
    case 'DOMNode':
      return compileDOM(nodesTree, varVar)
      break;
    case 'MustacheNode':
      return compileMustache(nodesTree, varVar)
      break;
    case 'TextNode':
      return JSON.stringify(nodesTree.text)
      break;
  }
}

function compileMustache(nodesTree, varVar) {
  var result

  if (nodesTree.variable_node) {
    result = varVar + '.' + nodesTree.variable_node.var_name.text
  } else {
    result = 'null'
  }
  return result
}

function prerareStyle(styleString) {
  return styleString // TODO
}

function prepareAttr({name, value}) {
  if (!name || !value) { return {} }
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

const types = {
  DOMNode: {
    _type: 'DOMNode',
  },
  MustacheNode: {
    _type: 'MustacheNode',
  },
  TextNode: {
    _type: 'TextNode',
  },
}

export var lowLevel = {
  compileAny,
  compileDOM,
  compileMustache,
  prerareStyle,
  prepareAttr,
  PEGtypes: types,
  PEGactions: actions,
  PEGparse: parse,
}

export default function(content) {
  this.cacheable();
  return `
    'use strict'
    // compiled with schwartzman
    var React = require('react')

    module.exports = function (props) {
      return (${compileDOM(parse(content, {actions, types}), 'props')})
    }
  `
};
