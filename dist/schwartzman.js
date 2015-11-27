'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashAssign = require('lodash.assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

var _grammar = require('./grammar');

var id = 0;

function isEscapedMustache(node) {
  return node._type === 'MustacheNode' && node.variable_node && (node.variable_node.text.slice(0, 3) == '{{{' || node.variable_node.text.slice(0, 3) == '{{&');
}

function compileAny(nodesTree, context) {
  switch (nodesTree._type) {
    case 'DOMNode':
      return compileDOM(nodesTree, context);
      break;
    case 'MustacheNode':
      return compileMustache(nodesTree, context);
      break;
    case 'TextNode':
      return { code: JSON.stringify(nodesTree.text) };
      break;
    case 'CommentedDOMNode':
      return { code: '// ' + nodesTree.elements[1].text.replace('\n', ' ') + '\n' };
      break;
  }
}

function compileMustache(nodesTree) {
  var context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var code = 'null';
  var varName;
  var children;
  var compiledChildren;
  var scopes = context.scopes || ['props'];

  if (nodesTree.variable_node) {
    varName = nodesTree.variable_node.var_name.text;
    if (scopes.length === 1) {
      code = 'props.' + varName;
    } else {
      code = 'scs([' + scopes.join(',') + '], "' + varName + '")';
    }
  } else if (nodesTree.section_node) {
    (function () {
      varName = nodesTree.section_node.var_name;
      var newScope = '__S_' + id++ + '_' + varName.replace(/[^a-zA-Z0-9\_]/, '');
      children = nodesTree.section_node.expr_node.elements;
      // TODO: keys for children
      // TODO: wrap text nodes in span
      if (children && children.length) {
        compiledChildren = children.map(function (n, index) {
          return compileAny(n, { varName: context.varName, scopes: [newScope].concat(scopes) }).code;
        });
        if (children.length === 1) {
          code = 'section([' + scopes.join(',') + '], "' + varName + '", function(' + newScope + '){ return (' + compiledChildren + ') })';
        } else {
          code = 'section([' + scopes.join(',') + '], "' + varName + '", function(' + newScope + '){ return [' + compiledChildren + '] })';
        }
      }
    })();
  } else if (nodesTree.inverted_section_node) {
    varName = nodesTree.inverted_section_node.var_name;
    children = nodesTree.inverted_section_node.expr_node.elements;
    // TODO: keys for children
    // TODO: wrap text nodes in span
    if (children && children.length) {
      compiledChildren = children.map(function (n, index) {
        return compileAny(n, context).code;
      });
      if (children.length === 1) {
        code = 'inverted_section([' + scopes.join(',') + '], "' + varName + '", function(){ return (' + compiledChildren + ') })';
      } else {
        code = 'inverted_section([' + scopes.join(',') + '], "' + varName + '", function(){ return [' + compiledChildren + '] })';
      }
    }
  } else if (nodesTree.commented_node) {
    code = '// ' + nodesTree.commented_node.text_node.text.replace('\n', ' ') + '\n';
  } else if (nodesTree.partial_node) {
    code = 'require("' + nodesTree.partial_node.path_node.text + '")(' + scopes[0] + ')';
  }
  return { code: code, escaped: isEscapedMustache(nodesTree) };
}

function prerareStyle(styleString) {
  return styleString; // TODO
}

function compileAttrsMustache(context, node) {
  var code = 'null';
  var scopes = (context.scopes || ['props']).slice();

  if (node.attr_section_node) {
    var varName = node.attr_section_node.var_name;
    var child = node.attr_section_node.expr_node.text;
    if (scopes.length == 1) {
      code = '"' + child + '": !!props.' + varName;
    } else {
      code = '"' + child + '": !!scs([' + scopes.join(',') + '], "' + varName + '")';
    }
  } else if (node.attr_inverted_section_node) {
    var varName = node.attr_inverted_section_node.var_name;
    var child = node.attr_inverted_section_node.expr_node.text;
    if (scopes.length == 1) {
      code = '"' + child + '": !props.' + varName;
    } else {
      code = '"' + child + '": !scs([' + scopes.join(',') + '], "' + varName + '")';
    }
  } else if (node.commented_node) {
    code = '// ' + node.commented_node.text_node.text.replace('\n', ' ') + '\n';
  }
  return { code: code, escaped: isEscapedMustache(node) };
}

function compileAttrs(context, acc, node) {
  var name = node.name;
  var value = node.value;
  var inner = node.inner;
  var _type = node._type;

  if (_type === 'MustacheNode') {
    return acc + (acc ? ',' : '') + compileAttrsMustache(context, node).code;
  }

  if (!name) {
    return acc;
  }
  var attrKey = inner ? name : name.text;
  var attrValue;

  if (!value) {
    attrValue = 'true';
  } else if (value._type === 'MustacheNode') {
    attrValue = compileMustache(value, context).code;
  } else if (!value.elements && !inner) {
    attrValue = JSON.stringify(value.text);
  } else if (!inner) {
    attrValue = value.elements.filter(function (v) {
      return v.text;
    }).map(function (v) {
      if (v._type === 'MustacheNode') {
        return compileMustache(v, context).code;
      } else {
        return JSON.stringify(v.text);
      }
    }).join('+');
  }

  switch (attrKey) {
    case 'class':
      attrKey = 'className';
      break;
    case 'style':
      attrValue = prerareStyle(attrValue);
      break;
    case 'dangerouslySetInnerHTML':
      attrValue = value;
      break;
  }

  attrKey = JSON.stringify(attrKey);

  return acc + (acc ? ',' : '') + attrKey + ':' + attrValue;
}

function compileDOM(nodesTree) {
  var context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var currentNodeHTML = nodesTree;
  var tagName;
  var attrs, attrsContent;
  var children;
  var compiledChildren;

  if (nodesTree.open) {
    tagName = nodesTree.open.tag_name;
    attrs = nodesTree.open.attrs.elements;
    children = nodesTree.nodes.elements;
  } else {
    tagName = nodesTree.tag_name;
    attrs = nodesTree.attrs.elements;
  }

  tagName = tagName.text.trim();

  if (children && children.length) {
    compiledChildren = children.map(function (n) {
      return compileAny(n, context);
    });

    if (compiledChildren.length === 1 && compiledChildren[0].escaped) {
      attrs = attrs.concat({
        name: 'dangerouslySetInnerHTML',
        value: '{"__html": ' + compiledChildren[0].code + '}',
        inner: true
      });
      compiledChildren = null;
    } else if (compiledChildren.filter(function (n) {
      return n.escaped;
    }).length) {
      throw new Error('Maximum one escaped child node allowed');
    }
  }

  attrsContent = attrs.reduce(compileAttrs.bind(null, context), '');
  attrs = attrsContent ? '{' + attrsContent + '}' : null;
  if (compiledChildren && !attrsContent.dangerouslySetInnerHTML) {
    return {
      code: 'React.DOM.' + tagName + '(\n        ' + attrs + '\n        ' + compiledChildren.reduce( // remove commas before comments
      function (acc, v) {
        return acc.replace(/,$/, '') + (v.code.indexOf('//') === 0 ? '' : ',') + v.code;
      }, ',') + '\n      )\n'
    };
  }

  return { code: 'React.DOM.' + tagName + '(' + attrs + ')\n' };
}

var actions = {
  removeQuotes: function removeQuotes(input, start, end, _ref) {
    var _ref2 = _slicedToArray(_ref, 3);

    var lq = _ref2[0];
    var text = _ref2[1];
    var rq = _ref2[2];
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

    if (nodes.elements.length > 1 && nodes.elements.filter(isEscapedMustache).length) {
      throw new SyntaxError('miss closed tag: ' + open.text.trim() + ' and ' + close.text.trim());
    }

    return { open: open, nodes: nodes, close: close };
  },
  validate_mustache: function validate_mustache(input, start, end, _ref4) {
    var _ref42 = _slicedToArray(_ref4, 3);

    var open = _ref42[0];
    var expr_node = _ref42[1];
    var close = _ref42[2];

    if (open.var_name.text != close.var_name.text) {
      throw new SyntaxError('miss closed tag: ' + open.text.trim() + ' and ' + close.text.trim());
    }
    return { var_name: open.var_name.text, expr_node: expr_node };
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
  },
  CommentedDOMNode: {
    _type: 'CommentedDOMNode'
  }
};

module.exports = function (content) {
  this.cacheable();
  return '\n    \'use strict\'\n    // compiled with schwartzman\n    var React = require(\'react\')\n    function includeKey(v, index) {\n      if (v.key === undefined) { v.key = index }\n      return v\n    }\n\n    function scs(scopes, name) { // scopes search\n      var result\n      var namePath = name.split(\'.\')\n\n      for (var i = 0; i < scopes.length; i++) {\n        result = scopes[i]\n        for (var n = 0; n < namePath.length && result != undefined; n++) {\n          result = result[namePath[n]]\n        }\n\n        if (result != undefined && n > 0) { return result }\n      }\n\n      return null\n    }\n\n    function section(scopes, varName, fn) {\n      var obj = scs(scopes, varName)\n      if (obj) {\n        if (obj.length !== void 0 && obj.map) {\n          return obj.length ? obj.map(includeKey).map(fn) : null\n        } else {\n          return fn(obj)\n        }\n      } else {\n        return null\n      }\n    }\n\n    function inverted_section(scopes, varName, fn) {\n      var obj = scs(scopes, varName)\n      if (!obj || obj.length && obj.length === 0) {\n        return fn()\n      } else {\n        return null\n      }\n    }\n\n    module.exports = function (props) {\n      return (' + compileDOM((0, _grammar.parse)(content, { actions: actions, types: types }), { varName: 'props', scopes: ['props'] }).code + ')\n    }\n  ';
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

