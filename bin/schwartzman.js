'use strict';

var _grammar = require('./grammar');

function compileAny(nodesTree, varVar) {
  if (nodesTree.html_tag || nodesTree.open_html_tag) {
    return compileDOM(nodesTree, varVar);
  } else {
    return compileMustache(nodesTree, varVar);
  }
}

function compileMustache(nodesTree, varVar) {}

function compileDOM(nodesTree, varVar) {
  var currentNodeHTML = nodesTree;

  var attrs = null;

  if (nodesTree.nodes // node with closing tag
   && nodesTree.open_html_tag.html_tag.text != nodesTree.close_html_tag.html_tag.text) {
    var _open = nodesTree.open_html_tag;
    var _close = nodesTree.close_html_tag;

    throw new Error('miss closed tag: ' + _open.text.trim() + ' and ' + _close.text.trim());
  }

  if (nodesTree.open_html_tag && !nodesTree.nodes.elements.length) {
    return 'React.DOM.' + nodesTree.open_html_tag.html_tag.text.trim() + '(' + attrs + ')';
  } else if (nodesTree.open_html_tag) {
    return '\n      React.DOM.' + nodesTree.open_html_tag.html_tag.text.trim() + '(\n        ' + attrs + ',\n        ' + nodesTree.nodes.elements.map(function (n) {
      return compileAny(n, varVar);
    }).join(', ') + '\n      )\n    ';
  } else {
    return 'React.DOM.' + nodesTree.html_tag.text.trim() + '(' + attrs + ')';
  }
}

module.exports = function (content) {
  this.cacheable();
  return '\n    \'use strict\'\n    // compiled with schwartzman\n    var React = require(\'react\')\n\n    module.exports = function (p) {\n      return (' + compileDOM((0, _grammar.parse)(content), 'p') + ')\n    }\n  ';
};

