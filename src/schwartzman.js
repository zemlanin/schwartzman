import assign from 'lodash.assign'
import {parse} from './grammar'

function isEscapedMustache(node) {
  return (
    node._type === 'MustacheNode'
    && node.variable_node
    && (
      node.variable_node.text.slice(0, 3) == '{{{' ||
      node.variable_node.text.slice(0, 3) == '{{&'
    )
  )
}

function compileAny(nodesTree, context) {
  switch (nodesTree._type) {
    case 'DOMNode':
      return compileDOM(nodesTree, context)
      break;
    case 'MustacheNode':
      return compileMustache(nodesTree, context)
      break;
    case 'TextNode':
      return {code: JSON.stringify(nodesTree.text)}
      break;
    case 'CommentedDOMNode':
      return {code: '// ' + nodesTree.elements[1].text.replace('\n', ' ') + '\n'}
      break;
  }
}

function compileMustache(nodesTree, context={}) {
  var code = 'null'
  var varName
  var children
  var compiledChildren

  if (nodesTree.variable_node) {
    varName = nodesTree.variable_node.var_name.text
    code = context.varName + '.' + varName
  } else if (nodesTree.section_node) {
    varName = nodesTree.section_node.var_name
    children = nodesTree.section_node.expr_node.elements
    // TODO: keys for children
    // TODO: wrap text nodes in span
    if (children && children.length) {
      compiledChildren = children.map((n, index) => compileAny(n, {varName}).code)
      if (children.length === 1) {
        code = `section(${context.varName}, "${varName}", function(${varName}){ return (${compiledChildren}) })`
      } else {
        code = `section(${context.varName}, "${varName}", function(${varName}){ return [${compiledChildren}] })`
      }
    }
  } else if (nodesTree.inverted_section_node) {
    varName = nodesTree.inverted_section_node.var_name
    children = nodesTree.inverted_section_node.expr_node.elements
    // TODO: keys for children
    // TODO: wrap text nodes in span
    if (children && children.length) {
      compiledChildren = children.map((n, index) => compileAny(n, {}).code)
      if (children.length === 1) {
        code = `inverted_section(${context.varName}, "${varName}", function(){ return (${compiledChildren}) })`
      } else {
        code = `inverted_section(${context.varName}, "${varName}", function(){ return [${compiledChildren}] })`
      }
    }
  } else if (nodesTree.commented_node) {
    code = '// ' + nodesTree.commented_node.text_node.text.replace('\n', ' ') + '\n'
  }
  return {code, escaped: isEscapedMustache(nodesTree)}
}

function prerareStyle(styleString) {
  return styleString // TODO
}

function compileAttrs(context, acc, {name, value, inner}) {
  if (!name || !value) { return acc }
  var attrKey = inner ? name : name.text
  var attrValue

  if (value._type === 'MustacheNode') {
    attrValue = compileMustache(value, context).code
  } else if (!value.elements && !inner) {
    attrValue = JSON.stringify(value.text)
  } else if (!inner) {
    attrValue = value.elements
      .filter(v => v.text)
      .map(v => {
        if (v._type === 'MustacheNode') {
          return compileMustache(v, context).code
        } else {
          return JSON.stringify(v.text)
        }
      })
      .join('+')
  }

  switch (attrKey) {
    case 'class':
      attrKey = 'className'
      break
    case 'style':
      attrValue = prerareStyle(attrValue)
      break
    case 'dangerouslySetInnerHTML':
      attrValue = value
      break
  }

  attrKey = JSON.stringify(attrKey)

  return acc + (acc ? ',' : '') + attrKey + ':' + attrValue
}

function compileDOM(nodesTree, context={}) {
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

  if (children && children.length) {
    compiledChildren = children.map(n => compileAny(n, context))

    if (compiledChildren.length === 1 && compiledChildren[0].escaped) {
      attrs = attrs.concat({
        name: 'dangerouslySetInnerHTML',
        value: `{"__html": ${compiledChildren[0].code}}`,
        inner: true,
      })
      compiledChildren = null
    } else if (compiledChildren.filter(n => n.escaped).length) {
      throw new Error('Maximum one escaped child node allowed')
    }
  }

  attrsContent = attrs.reduce(compileAttrs.bind(null, context), '')
  attrs = attrsContent ? '{' + attrsContent + '}' : null
  if (compiledChildren && !attrsContent.dangerouslySetInnerHTML) {
    return {
      code: `React.DOM.${tagName}(
        ${attrs}
        ${compiledChildren
          .reduce( // remove commas before comments
            (acc, v) => acc.replace(/,$/, '') + (v.code.indexOf('//') === 0 ? '': ',') + v.code,
            ','
          )
        }
      )\n`,
    }
  }

  return {code: `React.DOM.${tagName}(${attrs})\n`}
}

const actions = {
  removeQuotes: (input, start, end, [lq, text, rq]) => text,
  validate: (input, start, end, [open, nodes, close]) => {
    if (open.tag_name.text != close.tag_name.text) {
      throw new SyntaxError(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
    }

    if (nodes.elements.length > 1 && nodes.elements.filter(isEscapedMustache).length) {
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
    function includeKey(v, index) {
      if (v.key === undefined) { v.key = index }
      return v
    }

    function section(props, varName, fn) {
      var obj = props[varName]
      if (obj) {
        if (obj.length !== void 0 && obj.map) {
          return obj.length ? obj.map(includeKey).map(fn) : null
        } else if (!!(obj && obj.constructor && obj.call && obj.apply)) {
          return obj(props, fn)
        } else {
          return fn(obj)
        }
      } else {
        return null
      }
    }

    function inverted_section(props, varName, fn) {
      var obj = props[varName]
      if (!obj || obj.length && obj.length === 0) {
        return fn()
      } else {
        return null
      }
    }

    module.exports = function (props) {
      return (${compileDOM(parse(content, {actions, types}), {varName: 'props'}).code})
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
