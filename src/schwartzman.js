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
      return {code: JSON.stringify(nodesTree.text)}
      break;
    case 'CommentedDOMNode':
      return {code: '// ' + nodesTree.elements[1].text.replace('\n', ' ') + '\n'}
      break;
  }
}

function compileMustache(nodesTree, varVar) {
  var code
  var varName
  var compiledChild

  if (nodesTree.variable_node) {
    varName = nodesTree.variable_node.var_name.text
    code = varVar + '.' + varName
  } else if (nodesTree.section_node) {
    varName = nodesTree.section_node.var_name
    // TODO: keys for children
    compiledChild = compileAny(nodesTree.section_node.expr_node, varName)
    code = `${varVar}.${varName} && ${varVar}.${varName}.length ? ${varVar}.${varName}.map(function(${varName}){ return ${compiledChild.code} }) : null`
  } else {
    code = 'null'
  }
  return {code}
}

function prerareStyle(styleString) {
  return styleString // TODO
}

function compileAttrs(varVar, acc, {name, value}) {
  if (!name || !value) { return acc }
  var attrKey = name.text
  var attrValue

  if (value._type === 'MustacheNode') {
    attrValue = compileMustache(value, varVar).code
  } else if (!value.elements) {
    attrValue = JSON.stringify(value.text)
  } else {
    attrValue = value.elements
      .filter(v => v.text)
      .map(v => {
        if (v._type === 'MustacheNode') {
          return compileMustache(v, varVar).code
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
  var compiledChildren

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
    compiledChildren = children.map(n => compileAny(n, varVar))
    return {code: `React.DOM.${tagName}(
        ${attrs}
        ${compiledChildren
          .reduce( // remove commas before comments
            (acc, v) => acc.replace(/,$/, '') + (v.code.indexOf('//') === 0 ? '': ',') + v.code,
            ','
          )
        }
      )\n`}
  }

  return {code: `React.DOM.${tagName}(${attrs})\n`}
}

const actions = {
  removeQuotes: (input, start, end, [lq, text, rq]) => text,
  validate: (input, start, end, [open, nodes, close]) => {
    if (open.tag_name.text != close.tag_name.text) {
      throw new SyntaxError(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
    }
    return { open, nodes, close }
  },
  validate_mustache: (input, start, end, [open, expr_node, close]) => {
    if (open.var_name.text != close.var_name.text) {
      throw new SyntaxError(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
    }
    return { var_name: open.var_name.text, expr_node }
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
      return (${compileDOM(parse(content, {actions, types}), 'props').code})
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
