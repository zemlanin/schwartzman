import {parse} from './grammar'

let id = 0

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
  const scopes = context.scopes || ['props']

  if (nodesTree.variable_node) {
    varName = nodesTree.variable_node.var_name.text
    if (scopes.length === 1) {
      code = `props.${varName}`
    } else {
      code = `scs([${scopes.join(',')}], "${varName}")`
    }
  } else if (nodesTree.section_node) {
    varName = nodesTree.section_node.var_name
    const newScope = context.__plainScopeNames
                    ? varName.replace(/[^a-zA-Z0-9\_]/, '')
                    : `__S_${id++}_${varName.replace(/[^a-zA-Z0-9\_]/, '')}`
    children = nodesTree.section_node.expr_node.elements
    // TODO: keys for children
    // TODO: wrap text nodes in span
    if (children && children.length) {
      compiledChildren = children.map((n, index) => compileAny(
        n,
        {varName: context.varName, scopes: [newScope].concat(scopes), __plainScopeNames: context.__plainScopeNames}
      ).code)
      if (children.length === 1) {
        code = `section([${scopes.join(',')}], "${varName}", function(${newScope}){ return (${compiledChildren}) })`
      } else {
        code = `section([${scopes.join(',')}], "${varName}", function(${newScope}){ return [${compiledChildren}] })`
      }
    }
  } else if (nodesTree.inverted_section_node) {
    varName = nodesTree.inverted_section_node.var_name
    children = nodesTree.inverted_section_node.expr_node.elements
    // TODO: keys for children
    // TODO: wrap text nodes in span
    if (children && children.length) {
      compiledChildren = children.map((n, index) => compileAny(n, context).code)
      if (children.length === 1) {
        code = `inverted_section([${scopes.join(',')}], "${varName}", function(){ return (${compiledChildren}) })`
      } else {
        code = `inverted_section([${scopes.join(',')}], "${varName}", function(){ return [${compiledChildren}] })`
      }
    }
  } else if (nodesTree.commented_node) {
    code = '// ' + nodesTree.commented_node.text_node.text.replace('\n', ' ') + '\n'
  } else if (nodesTree.partial_node) {
    code = `require("${nodesTree.partial_node.path_node.text}")(${scopes[0]})`
  }
  return {code, escaped: isEscapedMustache(nodesTree)}
}

function dashToUpperCase(match, letter, offset, string) {
  return letter.toUpperCase()
}

function prerareStyle(styleString) {
  const attributes = styleString.split(';')

  let result = {}
  for (let entry of attributes) {
    const [key, value] = entry.split(/:(.+)/)

    if (!(key && value)) { continue }
    const formattedKey = key.toLowerCase()
                            .replace(/^\s+/, '')
                            .replace(/\s+$/, '')
                            .replace(/-([a-z])/g, dashToUpperCase)
                            .replace(/-/g, '')
    const formattedValue = value.replace(/^\s+/, '')
                                .replace(/\s+$/, '')

    result[formattedKey] = formattedValue
  }

  return JSON.stringify(result)
}

function compileAttrsMustache(context, node) {
  var code = 'null'
  const scopes = (context.scopes || ['props']).slice()

  if (node.attr_section_node) {
    let varName = node.attr_section_node.var_name
    let child = node.attr_section_node.expr_node.text
    if (scopes.length == 1) {
      code = `"${child}": !!props.${varName}`
    } else {
      code = `"${child}": !!scs([${scopes.join(',')}], "${varName}")`
    }
  } else if (node.attr_inverted_section_node) {
    let varName = node.attr_inverted_section_node.var_name
    let child = node.attr_inverted_section_node.expr_node.text
    if (scopes.length == 1) {
      code = `"${child}": !props.${varName}`
    } else {
      code = `"${child}": !scs([${scopes.join(',')}], "${varName}")`
    }
  } else if (node.commented_node) {
    code = '// ' + node.commented_node.text_node.text.replace('\n', ' ') + '\n'
  }
  return {code, escaped: isEscapedMustache(node)}
}

function compileAttrs(context, acc, node) {
  let {name, value, inner, _type} = node

  if (_type === 'MustacheNode') {
    return acc + (acc ? ',' : '') + compileAttrsMustache(context, node).code
  }

  if (!name) { return acc }
  var attrKey = inner ? name : name.text
  var attrValue

  if (!value) {
    attrValue = 'true'
  } else if (value._type === 'MustacheNode') {
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
      attrValue = prerareStyle(value.text)
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
      code: `React.createElement(
        "${tagName}",
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

  return {code: `React.createElement("${tagName}", ${attrs})\n`}
}

function dependencyMapper(name) {
  switch (name) {
    case 'react':
      return `var React = require('react')`
    case 'scs':  // scopes search
      return `function scs(scopes, name) {
        var result
        var namePath = name.split('.')

        for (var i = 0; i < scopes.length; i++) {
          result = scopes[i]
          for (var n = 0; n < namePath.length && result != undefined; n++) {
            result = result[namePath[n]]
          }

          if (result != undefined && n > 0) { return result }
        }

        return null
      }`
    case 'section':
      return `function includeKey(v, index) {
          if (v.key === undefined) { v.key = index }
          return v
        }

        function section(scopes, varName, fn) {
          var obj = scs(scopes, varName)
          if (obj) {
            if (obj.length !== void 0 && obj.map) {
              return obj.length ? obj.map(includeKey).map(fn) : null
            } else {
              return fn(obj)
            }
          } else {
            return null
          }
        }`
    case 'inverted_section':
      return ` function inverted_section(scopes, varName, fn) {
        var obj = scs(scopes, varName)
        if (!obj || obj.length && obj.length === 0) {
          return fn()
        } else {
          return null
        }
      }`
  }
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
  if (this && this.cacheable) { this.cacheable() }

  const parsedTree = parse(content, {actions, types})
  let result
  let dependencies

  switch (parsedTree.elements.length) {
    case 0:
      dependencies = []
      result = 'null'
      break
    case 1:
      dependencies = ['react', 'scs', 'section', 'inverted_section']
      result = '(' + compileAny(parsedTree.elements[0], {varName: 'props', scopes: ['props']}).code + ')'
      break
    default:
      dependencies = ['react', 'scs', 'section', 'inverted_section']
      result = '[(' + parsedTree.elements.map(
        el => compileAny(el, {varName: 'props', scopes: ['props']}).code
      ).join('),(') + ')]'
  }

  return `
    'use strict'
    // compiled with schwartzman
    ${dependencies.map(dependencyMapper).join('\n')}

    module.exports = function (props) { return ${result} }
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
