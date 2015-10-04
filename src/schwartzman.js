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
    case 'CommentedDOMNode':
      return '// ' + nodesTree.elements[1].text.replace('\n', ' ') + '\n'
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

function compileAttrs(varVar, acc, {name, value}) {
  if (!name || !value) { return acc }
  var attrKey = name.text
  var attrValue

  if (value._type === 'MustacheNode') {
    attrValue = compileMustache(value, varVar)
  } else if (!value.elements) {
    attrValue = JSON.stringify(value.text)
  } else {
    attrValue = value.elements
      .filter(v => v.text)
      .map(v => {
        if (v._type === 'MustacheNode') {
          return compileMustache(v, varVar)
        } else {
          return JSON.stringify(v.text)
        }
      })
      .join('+')
  }

  switch (attrKey) {
    case 'class':
      attrKey = 'className'
    case 'style':
      attrValue = prerareStyle(attrValue)
  }

  attrKey = JSON.stringify(attrKey)

  return acc + (acc ? ',' : '') + attrKey + ':' + attrValue
}

function compileDOM(nodesTree, varVar) {
  var currentNodeHTML = nodesTree
  var tagName
  var attrs, attrsContent
  var children

  if (nodesTree.open) {
    tagName = nodesTree.open.tag_name
    attrs = nodesTree.open.attrs.elements
    children = nodesTree.nodes.elements
  } else {
    tagName = nodesTree.tag_name
    attrs = nodesTree.attrs.elements
  }

  tagName = tagName.text.trim()
  attrsContent = attrs.reduce(compileAttrs.bind(null, varVar), '')
  attrs = attrsContent ? '{' + attrsContent + '}' : null

  if (children && children.length) {
    return `React.DOM.${tagName}(
        ${attrs}
        ${children
          .map(n => compileAny(n, varVar))
          .reduce( // remove commas before comments
            (acc, v) => acc.replace(/,$/, '') + (v.indexOf('//') === 0 ? '': ',') + v,
            ','
          )
        }
      )
`
  }

  return `React.DOM.${tagName}(${attrs})
`
}

const actions = {
  removeQuotes: (input, start, end, [lq, text, rq]) => text,
  validate: (input, start, end, [open, nodes, close]) => {
    if (open.tag_name.text != close.tag_name.text) {
      throw new SyntaxError(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
    }
    return { open, nodes, close }
  },
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
  CommentedDOMNode: {
    _type: 'CommentedDOMNode',
  },
}

module.exports = function(content) {
  this.cacheable();
  return `
    'use strict'
    // compiled with schwartzman
    var React = require('react')

    module.exports = function (props) {
      return (${compileDOM(parse(content, {actions, types}), 'props')})
    }
  `
}

module.exports.lowLevel = {
  compileAny,
  compileDOM,
  compileMustache,
  prerareStyle,
  compileAttrs,
  PEGtypes: types,
  PEGactions: actions,
  PEGparse: parse,
}
