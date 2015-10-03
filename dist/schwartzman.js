'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashAssign = require('lodash.assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _grammar = require('./grammar');

function compileAny(nodesTree, varVar) {
  switch (nodesTree._type) {
    case 'DOMNode':
      return compileDOM(nodesTree, varVar);
      break;
    case 'MustacheNode':
      return compileMustache(nodesTree, varVar);
      break;
    case 'TextNode':
      return JSON.stringify(nodesTree.text);
      break;
  }
}

function compileMustache(nodesTree, varVar) {
  var result;

  if (nodesTree.variable_node) {
    result = varVar + '.' + nodesTree.variable_node.var_name.text;
  } else {
    result = 'null';
  }
  return result;
}

function prerareStyle(styleString) {
  return styleString; // TODO
}

function compileAttrs(varVar, acc, _ref) {
  var name = _ref.name;
  var value = _ref.value;

  if (!name || !value) {
    return acc;
  }
  var attrKey = name.text;
  var attrValue;

  if (value._type === 'MustacheNode') {
    attrValue = compileMustache(value, varVar);
  } else if (!value.elements) {
    attrValue = JSON.stringify(value.text);
  } else {
    attrValue = value.elements.filter(function (v) {
      return v.text;
    }).map(function (v) {
      if (v._type === 'MustacheNode') {
        return compileMustache(v, varVar);
      } else {
        return JSON.stringify(v.text);
      }
    }).join('+');
  }

  switch (attrKey) {
    case 'class':
      attrKey = 'className';
    case 'style':
      attrValue = prerareStyle(attrValue);
  }

  attrKey = JSON.stringify(attrKey);

  return acc + (acc ? ',' : '') + attrKey + ':' + attrValue;
}

function compileDOM(nodesTree, varVar) {
  var currentNodeHTML = nodesTree;
  var tagName;
  var attrs, attrsContent;
  var children;

  if (nodesTree.open) {
    tagName = nodesTree.open.tag_name;
    attrs = nodesTree.open.attrs.elements;
    children = nodesTree.nodes.elements;
  } else {
    tagName = nodesTree.tag_name;
    attrs = nodesTree.attrs.elements;
  }

  tagName = tagName.text.trim();
  attrsContent = attrs.reduce(compileAttrs.bind(null, varVar), '');
  attrs = attrsContent ? '{' + attrsContent + '}' : null;

  if (children && children.length) {
    return '\n      React.DOM.' + tagName + '(\n        ' + attrs + ',\n        ' + children.map(function (n) {
      return compileAny(n, varVar);
    }).join(', ') + '\n      )\n    ';
  }

  return 'React.DOM.' + tagName + '(' + attrs + ')';
}

var actions = {
  removeQuotes: function removeQuotes(input, start, end, _ref2) {
    var _ref22 = _slicedToArray(_ref2, 3);

    var lq = _ref22[0];
    var text = _ref22[1];
    var rq = _ref22[2];
    return text;
  },
  validate: function validate(input, start, end, _ref3) {
    var _ref32 = _slicedToArray(_ref3, 3);

    var open = _ref32[0];
    var nodes = _ref32[1];
    var close = _ref32[2];

    if (open.tag_name.text != close.tag_name.text) {
      throw new SyntaxError('miss closed tag: ' + open.text.trim() + ' and ' + close.text.trim());
    }
    return { open: open, nodes: nodes, close: close };
  }
};

var types = {
  DOMNode: {
    _type: 'DOMNode'
  },
  MustacheNode: {
    _type: 'MustacheNode'
  },
  TextNode: {
    _type: 'TextNode'
  }
};

module.exports = function (content) {
  this.cacheable();
  return '\n    \'use strict\'\n    // compiled with schwartzman\n    var React = require(\'react\')\n\n    module.exports = function (props) {\n      return (' + compileDOM((0, _grammar.parse)(content, { actions: actions, types: types }), 'props') + ')\n    }\n  ';
};

module.exports.lowLevel = {
  compileAny: compileAny,
  compileDOM: compileDOM,
  compileMustache: compileMustache,
  prerareStyle: prerareStyle,
  compileAttrs: compileAttrs,
  PEGtypes: types,
  PEGactions: actions,
  PEGparse: _grammar.parse
};

