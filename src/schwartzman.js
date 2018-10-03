import {parse} from './grammar'
import {parseQuery} from 'loader-utils'

let id = 0
const HYPERSCRIPT = "h"
const RUNTIME_DEPENDENCIES = {
  prepareStyle: prepareStyle.name,
  scs: "scs",
  section: "section",
  inverted_section: "inverted_section",
  partial_node: "partial_node",
}

function createContext (prevContext, key, value) {
  var newContext = {
    varName: prevContext.varName,
    scopes: prevContext.scopes,
    dependencies: prevContext.dependencies,
    __plainScopeNames: prevContext.__plainScopeNames,
    __stringifyChildren: prevContext.__stringifyChildren,
  }

  if (key) {
    newContext[key] = value
  }

  return newContext
}

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

const ESCAPED_CURLY_REGEX = /\\([{}])/g

function compileAny(nodesTree, context) {
  switch (nodesTree._type) {
    case 'DOMNode':
      return compileDOM(nodesTree, context)
      break;
    case 'MustacheNode':
      return compileMustache(nodesTree, context)
      break;
    case 'TextNode':
      return {code: JSON.stringify(nodesTree.text.replace(ESCAPED_CURLY_REGEX, "$1"))}
      break;
    case 'NakedAttrNode':
      return {code: JSON.stringify(nodesTree.text)}
      break;
    case 'WhitespaceNode':
      return {code: JSON.stringify(nodesTree.text), whitespace: true}
      break;
    case 'CommentedDOMNode':
      return {code: '// ' + nodesTree.elements[1].text.replace('\n', ' ') + '\n'}
      break;
  }
}

function addDependency(context, dependency) {
  if (context && context.dependencies && !context.dependencies[dependency]) {
    context.dependencies[dependency] = 1
  }
  if (dependency === RUNTIME_DEPENDENCIES.section || dependency === RUNTIME_DEPENDENCIES.inverted_section) {
    addDependency(context, RUNTIME_DEPENDENCIES.scs)
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
      addDependency(context, RUNTIME_DEPENDENCIES.scs)
      code = `${RUNTIME_DEPENDENCIES.scs}([${scopes.join(',')}], "${varName}")`
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
        createContext(context, 'scopes', [newScope].concat(scopes))
      ).code)

      addDependency(context, RUNTIME_DEPENDENCIES.section)

      if (children.length === 1) {
        code = `${RUNTIME_DEPENDENCIES.section}([${scopes.join(',')}], "${varName}", function(${newScope}){ return (${compiledChildren}) }, ${JSON.stringify(nodesTree.section_node.expr_node.text)})`
      } else if (context.__stringifyChildren) {
        code = `${RUNTIME_DEPENDENCIES.section}([${scopes.join(',')}], "${varName}", function(${newScope}){ return [${compiledChildren}].join('') }, ${JSON.stringify(nodesTree.section_node.expr_node.text)})`
      } else {
        code = `${RUNTIME_DEPENDENCIES.section}([${scopes.join(',')}], "${varName}", function(${newScope}){ return [${compiledChildren}] }, ${JSON.stringify(nodesTree.section_node.expr_node.text)})`
      }

      if (context.__stringifyChildren) { code = `(${code} || '')` }
    }
  } else if (nodesTree.inverted_section_node) {
    varName = nodesTree.inverted_section_node.var_name
    children = nodesTree.inverted_section_node.expr_node.elements
    // TODO: keys for children
    // TODO: wrap text nodes in span
    if (children && children.length) {
      compiledChildren = children.map((n, index) => compileAny(n, context).code)
      addDependency(context, RUNTIME_DEPENDENCIES.inverted_section)
      if (children.length === 1) {
        code = `${RUNTIME_DEPENDENCIES.inverted_section}([${scopes.join(',')}], "${varName}", function(){ return (${compiledChildren}) })`
      } else if (context.__stringifyChildren) {
        code = `${RUNTIME_DEPENDENCIES.inverted_section}([${scopes.join(',')}], "${varName}", function(){ return [${compiledChildren}].join('') })`
      } else {
        code = `${RUNTIME_DEPENDENCIES.inverted_section}([${scopes.join(',')}], "${varName}", function(){ return [${compiledChildren}] })`
      }

      if (context.__stringifyChildren) { code = `(${code} || '')` }
    }
  } else if (nodesTree.commented_node) {
    code = '// ' + nodesTree.commented_node.comment_text_node.text.replace(ESCAPED_CURLY_REGEX, "$1").replace(/\n+/g, ' ') + '\n'
  } else if (nodesTree.partial_node) {
    addDependency(context, RUNTIME_DEPENDENCIES.partial_node)
    code = `${RUNTIME_DEPENDENCIES.partial_node}(require("${nodesTree.partial_node.path_node.text}"), ${scopes[0]})`
  }
  return {code, escaped: isEscapedMustache(nodesTree)}
}

function dashToUpperCase(match, letter, offset, string) {
  return letter.toUpperCase()
}

function prepareStyle(styleString) {
  if (!styleString) {
    return null
  }

  var attributes = styleString.split(';')

  var result = {}
  var keyAndValue, key, value, formattedKey, formattedValue
  for (var i = 0; i < attributes.length; i++) {
    keyAndValue = attributes[i].split(/:(.+)/)
    key = keyAndValue[0]
    value = keyAndValue[1]

    if (!(key && value)) { continue }
    formattedKey = key.toLowerCase()
                      .replace(/^\s+/, '')
                      .replace(/\s+$/, '')
                      .replace(/-([a-z])/g, dashToUpperCase)
                      .replace(/-/g, '')
    formattedValue = value.replace(/^\s+/, '')
                          .replace(/\s+$/, '')

    result[formattedKey] = formattedValue
  }

  return result
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
      addDependency(context, RUNTIME_DEPENDENCIES.scs)
      code = `"${child}": !!${RUNTIME_DEPENDENCIES.scs}([${scopes.join(',')}], "${varName}")`
    }
  } else if (node.attr_inverted_section_node) {
    let varName = node.attr_inverted_section_node.var_name
    let child = node.attr_inverted_section_node.expr_node.text
    if (scopes.length == 1) {
      code = `"${child}": !props.${varName}`
    } else {
      addDependency(context, RUNTIME_DEPENDENCIES.scs)
      code = `"${child}": !${RUNTIME_DEPENDENCIES.scs}([${scopes.join(',')}], "${varName}")`
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

  if (attrKey === 'class') { attrKey = 'className' }

  var mustacheInValue = false

  if (!value) {
    attrValue = 'true'
  } else if (value._type === 'MustacheNode') {
    mustacheInValue = true
    attrValue = compileMustache(value, createContext(context, '__stringifyChildren', true)).code
  } else if (!value.elements && !inner || value._type == "NakedAttrNode") {
    attrValue = JSON.stringify(value.text.replace(ESCAPED_CURLY_REGEX, "$1"))
  } else if (!inner) {
    attrValue = value.elements
      .filter(v => v.text)
      .map(v => {
        if (v._type === 'MustacheNode') {
          mustacheInValue = true
          return compileMustache(v, createContext(context, '__stringifyChildren', true)).code
        } else {
          return JSON.stringify(v.text.replace(ESCAPED_CURLY_REGEX, "$1"))
        }
      })
      .join('+')
  }

  if (attrKey === 'style') {
    if (mustacheInValue) {
      attrValue = RUNTIME_DEPENDENCIES.prepareStyle + "(" + attrValue + ")"
      addDependency(context, RUNTIME_DEPENDENCIES.prepareStyle)
    } else {
      attrValue = JSON.stringify(prepareStyle(value.text))
    }
  }

  if (attrKey === 'dangerouslySetInnerHTML') {
    attrValue = value
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
      code: `${HYPERSCRIPT}(
        "${tagName}",
        ${attrs}
        ${compiledChildren
          .reduce( // remove commas before comments
            (acc, v, index, array) => {
              if (v.whitespace) { return acc }
              const isComment = v.code.indexOf('//') === 0
              const followedByWhitespace = (array[index + 1] || {}).whitespace && v.code.match(/\S"$/)

              return (
                acc.replace(/,$/, '')
                + (isComment ? '': ',')
                + (followedByWhitespace ? v.code.replace(/"$/, " \"") : v.code)
              )
            },
            ','
          )
        }
      )\n`,
    }
  }

  return {code: `${HYPERSCRIPT}("${tagName}", ${attrs})\n`}
}

function dependencyMapper(lambdas, name) {
  switch (name) {
    case RUNTIME_DEPENDENCIES.scs:  // scopes search
      return `function ${RUNTIME_DEPENDENCIES.scs}(scopes, name) {
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
    case RUNTIME_DEPENDENCIES.section:
      return `function includeKey(v, index) {
          if (v.key === undefined) { v.key = index }
          return v
        }

      ${lambdas ?
        `function render(scopes, varName, raw) {
          var ll = require('schwartzman').lowLevel
          var parsed = ll.PEGparse(raw, {actions: ll.PEGactions, types: ll.PEGtypes})

          var props = {}
          for (var i = scopes.length - 1; i >= 0; i--) {
            for (var attr in scopes[i]) { props[attr] = scopes[i][attr] }
          }

          if (parsed.elements.length == 1) {
            return eval(ll.compileAny(parsed.elements[0], {varName: 'props', scopes: ['props']}).code)
          } else {
            return parsed.elements.map(function (el) { return eval(ll.compileAny(el, {varName: 'props', scopes: ['props']}).code)})
          }
        }` : ''
      }

        function ${RUNTIME_DEPENDENCIES.section}(scopes, varName, fn, raw) {
          var obj = ${RUNTIME_DEPENDENCIES.scs}(scopes, varName)
          if (obj) {
            if (obj.length !== void 0 && obj.map) {
              return obj.length ? obj.map(includeKey).map(fn) : null
      ${lambdas ?
           `} else if (!!(obj && obj.constructor && obj.call && obj.apply)) {
              return obj(raw, render.bind(null, scopes, varName))` : ''
      }
            } else {
              return fn(obj)
            }
          } else {
            return null
          }
        }`
    case RUNTIME_DEPENDENCIES.inverted_section:
      return `function ${RUNTIME_DEPENDENCIES.inverted_section}(scopes, varName, fn) {
        var obj = ${RUNTIME_DEPENDENCIES.scs}(scopes, varName)
        if (!obj || obj.length && obj.length === 0) {
          return fn()
        } else {
          return null
        }
      }`
    case RUNTIME_DEPENDENCIES.partial_node:
      return `function ${RUNTIME_DEPENDENCIES.partial_node}(module, props) {
        if (!module) { return null }

        if (module.__esModule) { return ${HYPERSCRIPT}(module.default, props) }

        return ${HYPERSCRIPT}(module, props)
      }`
    case RUNTIME_DEPENDENCIES.prepareStyle:
      return dashToUpperCase.toString() + ";" + prepareStyle.toString()
  }
}

function strip_whitespace_nodes(nodes) {
  let result = []

  if (nodes[0] && nodes[0]._type == 'WhitespaceNode') {
    nodes = nodes.splice(1)
  }

  if (nodes.length && nodes[nodes.length - 1] && nodes[nodes.length - 1]._type == 'WhitespaceNode') {
    nodes = nodes.splice(0, nodes.length - 1)
  }

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i]._type == 'WhitespaceNode') {
      if (result.length == 0) { continue }
      if (nodes[i+1] && nodes[i+1]._type == 'DOMNode') { continue }
      if (nodes[i+1] && nodes[i+1]._type == 'TextNode') {
        nodes[i+1].text = ' ' + nodes[i+1].text
        continue
      }
      switch (result[result.length - 1]._type) {
        case 'MustacheNode':
          if (nodes[i+1] && nodes[i+1]._type == 'MustacheNode') {
            nodes[i].text = ' '
            result.push(nodes[i])
          }
        case 'TextNode':
          if (!result[result.length - 1].text.match(/\s$/)) {
            result[result.length - 1].text = result[result.length - 1].text + ' '
          }
        case 'DOMNode':
        case 'WhitespaceNode':
        case 'CommentedDOMNode':
          continue
        default:
          throw new Error('Undefined behavior for strip_whitespace_nodes: ' + nodes[i]._type)
      }
    } else {
      result.push(nodes[i])
    }
  }

  return result
}

const actions = {
  strip_whitespaces: (input, start, end, elements) => {
    elements = strip_whitespace_nodes(elements)

    return {elements}
  },
  removeQuotes: (input, start, end, [lq, innerTextNode, rq]) => {
    innerTextNode.text = innerTextNode.text.replace(/\\(['"])/g, "$1")

    for (let i = 0; i < innerTextNode.elements.length; i++) {
      innerTextNode.elements[i].text = innerTextNode.elements[i].text.replace(/\\(['"])/g, "$1")
    }

    return innerTextNode
  },
  validate: (input, start, end, [open, nodes, close]) => {
    if (open.tag_name.text != close.tag_name.text) {
      throw new SyntaxError(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
    }

    nodes.elements = strip_whitespace_nodes(nodes.elements)

    if (nodes.elements.length > 1 && nodes.elements.filter(isEscapedMustache).length) {
      throw new SyntaxError(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
    }

    return { open, nodes, close }
  },
  validate_mustache: (input, start, end, [open, nodes, close]) => {
    if (open.var_name.text != close.var_name.text) {
      throw new SyntaxError(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
    }

    nodes.elements = strip_whitespace_nodes(nodes.elements)

    return { var_name: open.var_name.text, expr_node: nodes }
  },
}

const types = {
  DOMNode: {
    _type: 'DOMNode',
  },
  MustacheNode: {
    _type: 'MustacheNode',
  },
  WhitespaceNode: {
    _type: 'WhitespaceNode',
  },
  TextNode: {
    _type: 'TextNode',
  },
  CommentedDOMNode: {
    _type: 'CommentedDOMNode',
  },
  NakedAttrNode: {
    _type: 'NakedAttrNode',
  },
}

function objectKeys(obj) {
  var result = []

  for (const key in obj) {
    result.push(key)
  }

  return result
}

function schwartzman (content) {
  if (this && this.cacheable) { this.cacheable() }

  const lambdas = !!(this && parseQuery(this.query).lambdas)
  const prelude = (this && parseQuery(this.query).prelude) || `var ${HYPERSCRIPT} = require('react').createElement;`
  const parsedTree = parse(content, {actions, types})
  let result
  let dependencies = {}

  if (lambdas && parsedTree.elements.length) {
    for (const dep in RUNTIME_DEPENDENCIES) {
      dependencies[RUNTIME_DEPENDENCIES] = 1
    }
  }

  switch (parsedTree.elements.length) {
    case 0:
      result = 'null'
      break
    case 1:
      result = '(' + compileAny(parsedTree.elements[0], {varName: 'props', scopes: ['props'], dependencies}).code + ')'
      break
    default:
      result = '[(' + parsedTree.elements.map(
        el => compileAny(el, {varName: 'props', scopes: ['props'], dependencies}).code
      ).join('),(') + ')]'
  }

  return `
    'use strict'
    // compiled with schwartzman ${VERSION}
    ${parsedTree.elements.length ? prelude : ''}

    ${objectKeys(dependencies).map(dependencyMapper.bind(null, lambdas)).join('\n')}

    module.exports = function (props) { return ${result} }
    module.exports.raw = ${JSON.stringify(content)}
    if (typeof process != 'undefined' && process.env && process.env.NODE_ENV === 'test') { module.exports }
  `
}

module.exports = schwartzman
module.exports.schwartzman = schwartzman
module.exports.VERSION = VERSION
module.exports.lowLevel = {
  compileAny,
  compileDOM,
  compileMustache,
  prepareStyle,
  compileAttrs,
  PEGtypes: types,
  PEGactions: actions,
  PEGparse: parse,
}
