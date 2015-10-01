import {parse} from './grammar'

function compileAny(nodesTree, varVar) {
  if (nodesTree.html_tag || nodesTree.open_html_tag) {
    return compileDOM(nodesTree, varVar)
  } else {
    return compileMustache(nodesTree, varVar)
  }
}

function compileMustache(nodesTree, varVar) {}

function compileDOM(nodesTree, varVar) {
  var currentNodeHTML = nodesTree
  var attrs = null

  if (
    nodesTree.nodes  // node with closing tag
    && nodesTree.open_html_tag.html_tag.text != nodesTree.close_html_tag.html_tag.text
  ) {
    let {open_html_tag: open, close_html_tag: close} = nodesTree
    throw new Error(`miss closed tag: ${open.text.trim()} and ${close.text.trim()}`)
  }

  if (nodesTree.open_html_tag && !nodesTree.nodes.elements.length) {
    return `React.DOM.${nodesTree.open_html_tag.html_tag.text.trim()}(${attrs})`
  } else if (nodesTree.open_html_tag) {
    return `
      React.DOM.${nodesTree.open_html_tag.html_tag.text.trim()}(
        ${attrs},
        ${nodesTree.nodes.elements.map(n => compileAny(n, varVar)).join(', ')}
      )
    `
  } else {
    return `React.DOM.${nodesTree.html_tag.text.trim()}(${attrs})`
  }
}

module.exports = function(content) {
  this.cacheable();
  return `
    'use strict'
    // compiled with schwartzman
    var React = require('react')

    module.exports = function (p) {
      return (${compileDOM(parse(content), 'p')})
    }
  `
};
