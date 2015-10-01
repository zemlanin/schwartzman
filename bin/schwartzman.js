'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _lodashAssign = require('lodash.assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _grammar = require('./grammar');

function compileAny(nodesTree, varVar) {
  if (nodesTree.html_tag || nodesTree.open_html_tag) {
    return compileDOM(nodesTree, varVar);
  } else {
    return compileMustache(nodesTree, varVar);
  }
}

function compileMustache(nodesTree, varVar) {}

function prerareStyle(styleString) {
  return styleString; // TODO
}

function prepareAttr(_ref2) {
  var name = _ref2.name;
  var value = _ref2.value;

  var attrKey = name.text;
  var attrValue = value.text;

  switch (attrKey) {
    case 'class':
      attrKey = 'className';
    case 'style':
      attrValue = prerareStyle(attrValue);
  }
  return _defineProperty({}, attrKey, attrValue);
}

function compileDOM(nodesTree, varVar) {
  var currentNodeHTML = nodesTree;
  var tagName;
  var attrs;
  var children;

  if (nodesTree.nodes // node with closing tag
   && nodesTree.open_html_tag.tag_name.text != nodesTree.close_html_tag.tag_name.text) {
    var _open = nodesTree.open_html_tag;
    var _close = nodesTree.close_html_tag;

    throw new Error('miss closed tag: ' + _open.text.trim() + ' and ' + _close.text.trim());
  }

  if (nodesTree.open_html_tag) {
    tagName = nodesTree.open_html_tag.tag_name;
    attrs = nodesTree.open_html_tag.attrs.elements;
    children = nodesTree.nodes.elements;
  } else {
    tagName = nodesTree.tag_name;
    attrs = nodesTree.attrs.elements;
  }

  tagName = tagName.text.trim();
  attrs = attrs.map(prepareAttr).reduce(_lodashAssign2['default'], {});

  if (children && children.length) {
    return '\n      React.DOM.' + tagName + '(\n        ' + JSON.stringify(attrs) + ',\n        ' + children.map(function (n) {
      return compileAny(n, varVar);
    }).join(', ') + '\n      )\n    ';
  }

  return 'React.DOM.' + tagName + '(' + JSON.stringify(attrs) + ')';
}

var actions = {
  removeQuotes: function removeQuotes(input, start, end, _ref3) {
    var _ref32 = _slicedToArray(_ref3, 3);

    var lq = _ref32[0];
    var text = _ref32[1];
    var rq = _ref32[2];
    return text;
  }
};

module.exports = function (content) {
  this.cacheable();
  return '\n    \'use strict\'\n    // compiled with schwartzman\n    var React = require(\'react\')\n\n    module.exports = function (p) {\n      return (' + compileDOM((0, _grammar.parse)(content, { actions: actions }), 'p') + ')\n    }\n  ';
};

