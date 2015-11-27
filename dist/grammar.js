(function() {
  'use strict';

  var extend = function (destination, source) {
    if (!destination || !source) return destination;
    for (var key in source) {
      if (destination[key] !== source[key])
        destination[key] = source[key];
    }
    return destination;
  };

  var formatError = function (input, offset, expected) {
    var lines = input.split(/\n/g),
        lineNo = 0,
        position = 0;

    while (position <= offset) {
      position += lines[lineNo].length + 1;
      lineNo += 1;
    }
    var message = 'Line ' + lineNo + ': expected ' + expected.join(', ') + '\n',
        line = lines[lineNo - 1];

    message += line + '\n';
    position -= line.length + 1;

    while (position < offset) {
      message += ' ';
      position += 1;
    }
    return message + '^';
  };

  var inherit = function (subclass, parent) {
    var chain = function() {};
    chain.prototype = parent.prototype;
    subclass.prototype = new chain();
    subclass.prototype.constructor = subclass;
  };

  var TreeNode = function(text, offset, elements) {
    this.text = text;
    this.offset = offset;
    this.elements = elements || [];
  };

  TreeNode.prototype.forEach = function(block, context) {
    for (var el = this.elements, i = 0, n = el.length; i < n; i++) {
      block.call(context, el[i], i, el);
    }
  };

  var TreeNode1 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['open_html_tag'] = elements[0];
    this['close_html_tag'] = elements[2];
  };
  inherit(TreeNode1, TreeNode);

  var TreeNode2 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['tag_name'] = elements[2];
    this['attrs'] = elements[4];
  };
  inherit(TreeNode2, TreeNode);

  var TreeNode3 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['tag_name'] = elements[2];
    this['attrs'] = elements[4];
  };
  inherit(TreeNode3, TreeNode);

  var TreeNode4 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['tag_name'] = elements[1];
  };
  inherit(TreeNode4, TreeNode);

  var TreeNode5 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['name'] = elements[0];
    this['dashed_var_name'] = elements[0];
    this['value'] = elements[2];
  };
  inherit(TreeNode5, TreeNode);

  var TreeNode6 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['name'] = elements[0];
    this['dashed_var_name'] = elements[0];
  };
  inherit(TreeNode6, TreeNode);

  var TreeNode7 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['attr_section_node'] = elements[0];
  };
  inherit(TreeNode7, TreeNode);

  var TreeNode8 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['attr_inverted_section_node'] = elements[0];
  };
  inherit(TreeNode8, TreeNode);

  var TreeNode9 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['commented_node'] = elements[0];
  };
  inherit(TreeNode9, TreeNode);

  var TreeNode10 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['open_section_node'] = elements[0];
    this['close_section_node'] = elements[2];
  };
  inherit(TreeNode10, TreeNode);

  var TreeNode11 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['open_inverted_section_node'] = elements[0];
    this['close_section_node'] = elements[2];
  };
  inherit(TreeNode11, TreeNode);

  var TreeNode12 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['variable_node'] = elements[0];
  };
  inherit(TreeNode12, TreeNode);

  var TreeNode13 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['section_node'] = elements[0];
  };
  inherit(TreeNode13, TreeNode);

  var TreeNode14 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['inverted_section_node'] = elements[0];
  };
  inherit(TreeNode14, TreeNode);

  var TreeNode15 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['commented_node'] = elements[0];
  };
  inherit(TreeNode15, TreeNode);

  var TreeNode16 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['partial_node'] = elements[0];
  };
  inherit(TreeNode16, TreeNode);

  var TreeNode17 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['var_name'] = elements[2];
  };
  inherit(TreeNode17, TreeNode);

  var TreeNode18 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['var_name'] = elements[2];
  };
  inherit(TreeNode18, TreeNode);

  var TreeNode19 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['var_name'] = elements[2];
  };
  inherit(TreeNode19, TreeNode);

  var TreeNode20 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['open_section_node'] = elements[0];
    this['close_section_node'] = elements[2];
  };
  inherit(TreeNode20, TreeNode);

  var TreeNode21 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['var_name'] = elements[2];
  };
  inherit(TreeNode21, TreeNode);

  var TreeNode22 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['var_name'] = elements[2];
  };
  inherit(TreeNode22, TreeNode);

  var TreeNode23 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['open_inverted_section_node'] = elements[0];
    this['close_section_node'] = elements[2];
  };
  inherit(TreeNode23, TreeNode);

  var TreeNode24 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['var_name'] = elements[2];
  };
  inherit(TreeNode24, TreeNode);

  var TreeNode25 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['text_node'] = elements[2];
  };
  inherit(TreeNode25, TreeNode);

  var TreeNode26 = function(text, offset, elements) {
    TreeNode.apply(this, arguments);
    this['path_node'] = elements[2];
  };
  inherit(TreeNode26, TreeNode);

  var FAILURE = {};

  var Grammar = {
    _read_dom_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._dom_node = this._cache._dom_node || {};
      var cached = this._cache._dom_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = new Array(3);
      var address1 = FAILURE;
      address1 = this._read_open_html_tag();
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 0, index3 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          address3 = this._read_expr_node();
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index3, this._offset), index3, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address4 = FAILURE;
          address4 = this._read_close_html_tag();
          if (address4 !== FAILURE) {
            elements0[2] = address4;
          } else {
            elements0 = null;
            this._offset = index2;
          }
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = this._actions.validate(this._input, index2, this._offset, elements0);
        this._offset = this._offset;
      }
      extend(address0, this._types.DOMNode);
      if (address0 === FAILURE) {
        this._offset = index1;
        address0 = this._read_contained_html_tag();
        extend(address0, this._types.DOMNode);
        if (address0 === FAILURE) {
          this._offset = index1;
          address0 = this._read_commented_html();
          extend(address0, this._types.CommentedDOMNode);
          if (address0 === FAILURE) {
            this._offset = index1;
          }
        }
      }
      this._cache._dom_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_open_html_tag: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._open_html_tag = this._cache._open_html_tag || {};
      var cached = this._cache._open_html_tag[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(8);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 1);
      }
      if (chunk0 === '<') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
        this._offset = this._offset + 1;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"<"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_tag_name();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index3 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index3, index3), index3);
              this._offset = index3;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var remaining0 = 0, index4 = this._offset, elements1 = [], address6 = true;
              while (address6 !== FAILURE) {
                address6 = this._read_dom_attr();
                if (address6 !== FAILURE) {
                  elements1.push(address6);
                  --remaining0;
                }
              }
              if (remaining0 <= 0) {
                address5 = new TreeNode(this._input.substring(index4, this._offset), index4, elements1);
                this._offset = this._offset;
              } else {
                address5 = FAILURE;
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
                var address7 = FAILURE;
                var index5 = this._offset;
                address7 = this._read_whitespace();
                if (address7 === FAILURE) {
                  address7 = new TreeNode(this._input.substring(index5, index5), index5);
                  this._offset = index5;
                }
                if (address7 !== FAILURE) {
                  elements0[5] = address7;
                  var address8 = FAILURE;
                  var chunk1 = null;
                  if (this._offset < this._inputSize) {
                    chunk1 = this._input.substring(this._offset, this._offset + 1);
                  }
                  if (chunk1 === '>') {
                    address8 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
                    this._offset = this._offset + 1;
                  } else {
                    address8 = FAILURE;
                    if (this._offset > this._failure) {
                      this._failure = this._offset;
                      this._expected = [];
                    }
                    if (this._offset === this._failure) {
                      this._expected.push('">"');
                    }
                  }
                  if (address8 !== FAILURE) {
                    elements0[6] = address8;
                    var address9 = FAILURE;
                    var index6 = this._offset;
                    address9 = this._read_whitespace();
                    if (address9 === FAILURE) {
                      address9 = new TreeNode(this._input.substring(index6, index6), index6);
                      this._offset = index6;
                    }
                    if (address9 !== FAILURE) {
                      elements0[7] = address9;
                    } else {
                      elements0 = null;
                      this._offset = index1;
                    }
                  } else {
                    elements0 = null;
                    this._offset = index1;
                  }
                } else {
                  elements0 = null;
                  this._offset = index1;
                }
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode2(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._open_html_tag[index0] = [address0, this._offset];
      return address0;
    },

    _read_contained_html_tag: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._contained_html_tag = this._cache._contained_html_tag || {};
      var cached = this._cache._contained_html_tag[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(8);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 1);
      }
      if (chunk0 === '<') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
        this._offset = this._offset + 1;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"<"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_tag_name();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index3 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index3, index3), index3);
              this._offset = index3;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var remaining0 = 0, index4 = this._offset, elements1 = [], address6 = true;
              while (address6 !== FAILURE) {
                address6 = this._read_dom_attr();
                if (address6 !== FAILURE) {
                  elements1.push(address6);
                  --remaining0;
                }
              }
              if (remaining0 <= 0) {
                address5 = new TreeNode(this._input.substring(index4, this._offset), index4, elements1);
                this._offset = this._offset;
              } else {
                address5 = FAILURE;
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
                var address7 = FAILURE;
                var index5 = this._offset;
                address7 = this._read_whitespace();
                if (address7 === FAILURE) {
                  address7 = new TreeNode(this._input.substring(index5, index5), index5);
                  this._offset = index5;
                }
                if (address7 !== FAILURE) {
                  elements0[5] = address7;
                  var address8 = FAILURE;
                  var chunk1 = null;
                  if (this._offset < this._inputSize) {
                    chunk1 = this._input.substring(this._offset, this._offset + 2);
                  }
                  if (chunk1 === '/>') {
                    address8 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
                    this._offset = this._offset + 2;
                  } else {
                    address8 = FAILURE;
                    if (this._offset > this._failure) {
                      this._failure = this._offset;
                      this._expected = [];
                    }
                    if (this._offset === this._failure) {
                      this._expected.push('"/>"');
                    }
                  }
                  if (address8 !== FAILURE) {
                    elements0[6] = address8;
                    var address9 = FAILURE;
                    var index6 = this._offset;
                    address9 = this._read_whitespace();
                    if (address9 === FAILURE) {
                      address9 = new TreeNode(this._input.substring(index6, index6), index6);
                      this._offset = index6;
                    }
                    if (address9 !== FAILURE) {
                      elements0[7] = address9;
                    } else {
                      elements0 = null;
                      this._offset = index1;
                    }
                  } else {
                    elements0 = null;
                    this._offset = index1;
                  }
                } else {
                  elements0 = null;
                  this._offset = index1;
                }
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode3(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._contained_html_tag[index0] = [address0, this._offset];
      return address0;
    },

    _read_close_html_tag: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._close_html_tag = this._cache._close_html_tag || {};
      var cached = this._cache._close_html_tag[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(4);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 2);
      }
      if (chunk0 === '</') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
        this._offset = this._offset + 2;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"</"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        address2 = this._read_tag_name();
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          var chunk1 = null;
          if (this._offset < this._inputSize) {
            chunk1 = this._input.substring(this._offset, this._offset + 1);
          }
          if (chunk1 === '>') {
            address3 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
            this._offset = this._offset + 1;
          } else {
            address3 = FAILURE;
            if (this._offset > this._failure) {
              this._failure = this._offset;
              this._expected = [];
            }
            if (this._offset === this._failure) {
              this._expected.push('">"');
            }
          }
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index2 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index2, index2), index2);
              this._offset = index2;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode4(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._close_html_tag[index0] = [address0, this._offset];
      return address0;
    },

    _read_tag_name: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._tag_name = this._cache._tag_name || {};
      var cached = this._cache._tag_name[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var remaining0 = 1, index1 = this._offset, elements0 = [], address1 = true;
      while (address1 !== FAILURE) {
        var chunk0 = null;
        if (this._offset < this._inputSize) {
          chunk0 = this._input.substring(this._offset, this._offset + 1);
        }
        if (chunk0 !== null && /^[a-z]/.test(chunk0)) {
          address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
          this._offset = this._offset + 1;
        } else {
          address1 = FAILURE;
          if (this._offset > this._failure) {
            this._failure = this._offset;
            this._expected = [];
          }
          if (this._offset === this._failure) {
            this._expected.push('[a-z]');
          }
        }
        if (address1 !== FAILURE) {
          elements0.push(address1);
          --remaining0;
        }
      }
      if (remaining0 <= 0) {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      } else {
        address0 = FAILURE;
      }
      this._cache._tag_name[index0] = [address0, this._offset];
      return address0;
    },

    _read_dom_attr: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._dom_attr = this._cache._dom_attr || {};
      var cached = this._cache._dom_attr[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = new Array(4);
      var address1 = FAILURE;
      address1 = this._read_dashed_var_name();
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var chunk0 = null;
        if (this._offset < this._inputSize) {
          chunk0 = this._input.substring(this._offset, this._offset + 1);
        }
        if (chunk0 === '=') {
          address2 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
          this._offset = this._offset + 1;
        } else {
          address2 = FAILURE;
          if (this._offset > this._failure) {
            this._failure = this._offset;
            this._expected = [];
          }
          if (this._offset === this._failure) {
            this._expected.push('"="');
          }
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          var index3 = this._offset;
          address3 = this._read_dq_string_literal();
          if (address3 === FAILURE) {
            this._offset = index3;
            address3 = this._read_sq_string_literal();
            if (address3 === FAILURE) {
              this._offset = index3;
              address3 = this._read_var_name();
              if (address3 === FAILURE) {
                this._offset = index3;
                address3 = this._read_mustache_node();
                if (address3 === FAILURE) {
                  this._offset = index3;
                }
              }
            }
          }
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index4 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index4, index4), index4);
              this._offset = index4;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
            } else {
              elements0 = null;
              this._offset = index2;
            }
          } else {
            elements0 = null;
            this._offset = index2;
          }
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode5(this._input.substring(index2, this._offset), index2, elements0);
        this._offset = this._offset;
      }
      if (address0 === FAILURE) {
        this._offset = index1;
        var index5 = this._offset, elements1 = new Array(2);
        var address5 = FAILURE;
        address5 = this._read_dashed_var_name();
        if (address5 !== FAILURE) {
          elements1[0] = address5;
          var address6 = FAILURE;
          var index6 = this._offset;
          address6 = this._read_whitespace();
          if (address6 === FAILURE) {
            address6 = new TreeNode(this._input.substring(index6, index6), index6);
            this._offset = index6;
          }
          if (address6 !== FAILURE) {
            elements1[1] = address6;
          } else {
            elements1 = null;
            this._offset = index5;
          }
        } else {
          elements1 = null;
          this._offset = index5;
        }
        if (elements1 === null) {
          address0 = FAILURE;
        } else {
          address0 = new TreeNode6(this._input.substring(index5, this._offset), index5, elements1);
          this._offset = this._offset;
        }
        if (address0 === FAILURE) {
          this._offset = index1;
          address0 = this._read_attr_mustache_node();
          if (address0 === FAILURE) {
            this._offset = index1;
          }
        }
      }
      this._cache._dom_attr[index0] = [address0, this._offset];
      return address0;
    },

    _read_commented_html: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._commented_html = this._cache._commented_html || {};
      var cached = this._cache._commented_html[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(4);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 4);
      }
      if (chunk0 === '<!--') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 4), this._offset);
        this._offset = this._offset + 4;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"<!--"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 0, index2 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          var index3 = this._offset, elements2 = new Array(2);
          var address4 = FAILURE;
          var index4 = this._offset;
          var chunk1 = null;
          if (this._offset < this._inputSize) {
            chunk1 = this._input.substring(this._offset, this._offset + 3);
          }
          if (chunk1 === '-->') {
            address4 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
            this._offset = this._offset + 3;
          } else {
            address4 = FAILURE;
            if (this._offset > this._failure) {
              this._failure = this._offset;
              this._expected = [];
            }
            if (this._offset === this._failure) {
              this._expected.push('"-->"');
            }
          }
          this._offset = index4;
          if (address4 === FAILURE) {
            address4 = new TreeNode(this._input.substring(this._offset, this._offset), this._offset);
            this._offset = this._offset;
          } else {
            address4 = FAILURE;
          }
          if (address4 !== FAILURE) {
            elements2[0] = address4;
            var address5 = FAILURE;
            if (this._offset < this._inputSize) {
              address5 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
              this._offset = this._offset + 1;
            } else {
              address5 = FAILURE;
              if (this._offset > this._failure) {
                this._failure = this._offset;
                this._expected = [];
              }
              if (this._offset === this._failure) {
                this._expected.push('<any char>');
              }
            }
            if (address5 !== FAILURE) {
              elements2[1] = address5;
            } else {
              elements2 = null;
              this._offset = index3;
            }
          } else {
            elements2 = null;
            this._offset = index3;
          }
          if (elements2 === null) {
            address3 = FAILURE;
          } else {
            address3 = new TreeNode(this._input.substring(index3, this._offset), index3, elements2);
            this._offset = this._offset;
          }
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index2, this._offset), index2, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address6 = FAILURE;
          var chunk2 = null;
          if (this._offset < this._inputSize) {
            chunk2 = this._input.substring(this._offset, this._offset + 3);
          }
          if (chunk2 === '-->') {
            address6 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
            this._offset = this._offset + 3;
          } else {
            address6 = FAILURE;
            if (this._offset > this._failure) {
              this._failure = this._offset;
              this._expected = [];
            }
            if (this._offset === this._failure) {
              this._expected.push('"-->"');
            }
          }
          if (address6 !== FAILURE) {
            elements0[2] = address6;
            var address7 = FAILURE;
            var index5 = this._offset;
            address7 = this._read_whitespace();
            if (address7 === FAILURE) {
              address7 = new TreeNode(this._input.substring(index5, index5), index5);
              this._offset = index5;
            }
            if (address7 !== FAILURE) {
              elements0[3] = address7;
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._commented_html[index0] = [address0, this._offset];
      return address0;
    },

    _read_attr_mustache_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._attr_mustache_node = this._cache._attr_mustache_node || {};
      var cached = this._cache._attr_mustache_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = new Array(2);
      var address1 = FAILURE;
      address1 = this._read_attr_section_node();
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index3 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index3, index3), index3);
          this._offset = index3;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode7(this._input.substring(index2, this._offset), index2, elements0);
        this._offset = this._offset;
      }
      extend(address0, this._types.MustacheNode);
      if (address0 === FAILURE) {
        this._offset = index1;
        var index4 = this._offset, elements1 = new Array(2);
        var address3 = FAILURE;
        address3 = this._read_attr_inverted_section_node();
        if (address3 !== FAILURE) {
          elements1[0] = address3;
          var address4 = FAILURE;
          var index5 = this._offset;
          address4 = this._read_whitespace();
          if (address4 === FAILURE) {
            address4 = new TreeNode(this._input.substring(index5, index5), index5);
            this._offset = index5;
          }
          if (address4 !== FAILURE) {
            elements1[1] = address4;
          } else {
            elements1 = null;
            this._offset = index4;
          }
        } else {
          elements1 = null;
          this._offset = index4;
        }
        if (elements1 === null) {
          address0 = FAILURE;
        } else {
          address0 = new TreeNode8(this._input.substring(index4, this._offset), index4, elements1);
          this._offset = this._offset;
        }
        extend(address0, this._types.MustacheNode);
        if (address0 === FAILURE) {
          this._offset = index1;
          var index6 = this._offset, elements2 = new Array(2);
          var address5 = FAILURE;
          address5 = this._read_commented_node();
          if (address5 !== FAILURE) {
            elements2[0] = address5;
            var address6 = FAILURE;
            var index7 = this._offset;
            address6 = this._read_whitespace();
            if (address6 === FAILURE) {
              address6 = new TreeNode(this._input.substring(index7, index7), index7);
              this._offset = index7;
            }
            if (address6 !== FAILURE) {
              elements2[1] = address6;
            } else {
              elements2 = null;
              this._offset = index6;
            }
          } else {
            elements2 = null;
            this._offset = index6;
          }
          if (elements2 === null) {
            address0 = FAILURE;
          } else {
            address0 = new TreeNode9(this._input.substring(index6, this._offset), index6, elements2);
            this._offset = this._offset;
          }
          extend(address0, this._types.MustacheNode);
          if (address0 === FAILURE) {
            this._offset = index1;
          }
        }
      }
      this._cache._attr_mustache_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_attr_section_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._attr_section_node = this._cache._attr_section_node || {};
      var cached = this._cache._attr_section_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(3);
      var address1 = FAILURE;
      address1 = this._read_open_section_node();
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_var_name();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_close_section_node();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = this._actions.validate_mustache(this._input, index1, this._offset, elements0);
        this._offset = this._offset;
      }
      this._cache._attr_section_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_attr_inverted_section_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._attr_inverted_section_node = this._cache._attr_inverted_section_node || {};
      var cached = this._cache._attr_inverted_section_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(3);
      var address1 = FAILURE;
      address1 = this._read_open_inverted_section_node();
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_var_name();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_close_section_node();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = this._actions.validate_mustache(this._input, index1, this._offset, elements0);
        this._offset = this._offset;
      }
      this._cache._attr_inverted_section_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_expr_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._expr_node = this._cache._expr_node || {};
      var cached = this._cache._expr_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset;
      address0 = this._read_dom_node();
      if (address0 === FAILURE) {
        this._offset = index1;
        address0 = this._read_mustache_node();
        if (address0 === FAILURE) {
          this._offset = index1;
          address0 = this._read_text_node();
          if (address0 === FAILURE) {
            this._offset = index1;
          }
        }
      }
      this._cache._expr_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_mustache_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._mustache_node = this._cache._mustache_node || {};
      var cached = this._cache._mustache_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = new Array(2);
      var address1 = FAILURE;
      address1 = this._read_variable_node();
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index3 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index3, index3), index3);
          this._offset = index3;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode12(this._input.substring(index2, this._offset), index2, elements0);
        this._offset = this._offset;
      }
      extend(address0, this._types.MustacheNode);
      if (address0 === FAILURE) {
        this._offset = index1;
        var index4 = this._offset, elements1 = new Array(2);
        var address3 = FAILURE;
        address3 = this._read_section_node();
        if (address3 !== FAILURE) {
          elements1[0] = address3;
          var address4 = FAILURE;
          var index5 = this._offset;
          address4 = this._read_whitespace();
          if (address4 === FAILURE) {
            address4 = new TreeNode(this._input.substring(index5, index5), index5);
            this._offset = index5;
          }
          if (address4 !== FAILURE) {
            elements1[1] = address4;
          } else {
            elements1 = null;
            this._offset = index4;
          }
        } else {
          elements1 = null;
          this._offset = index4;
        }
        if (elements1 === null) {
          address0 = FAILURE;
        } else {
          address0 = new TreeNode13(this._input.substring(index4, this._offset), index4, elements1);
          this._offset = this._offset;
        }
        extend(address0, this._types.MustacheNode);
        if (address0 === FAILURE) {
          this._offset = index1;
          var index6 = this._offset, elements2 = new Array(2);
          var address5 = FAILURE;
          address5 = this._read_inverted_section_node();
          if (address5 !== FAILURE) {
            elements2[0] = address5;
            var address6 = FAILURE;
            var index7 = this._offset;
            address6 = this._read_whitespace();
            if (address6 === FAILURE) {
              address6 = new TreeNode(this._input.substring(index7, index7), index7);
              this._offset = index7;
            }
            if (address6 !== FAILURE) {
              elements2[1] = address6;
            } else {
              elements2 = null;
              this._offset = index6;
            }
          } else {
            elements2 = null;
            this._offset = index6;
          }
          if (elements2 === null) {
            address0 = FAILURE;
          } else {
            address0 = new TreeNode14(this._input.substring(index6, this._offset), index6, elements2);
            this._offset = this._offset;
          }
          extend(address0, this._types.MustacheNode);
          if (address0 === FAILURE) {
            this._offset = index1;
            var index8 = this._offset, elements3 = new Array(2);
            var address7 = FAILURE;
            address7 = this._read_commented_node();
            if (address7 !== FAILURE) {
              elements3[0] = address7;
              var address8 = FAILURE;
              var index9 = this._offset;
              address8 = this._read_whitespace();
              if (address8 === FAILURE) {
                address8 = new TreeNode(this._input.substring(index9, index9), index9);
                this._offset = index9;
              }
              if (address8 !== FAILURE) {
                elements3[1] = address8;
              } else {
                elements3 = null;
                this._offset = index8;
              }
            } else {
              elements3 = null;
              this._offset = index8;
            }
            if (elements3 === null) {
              address0 = FAILURE;
            } else {
              address0 = new TreeNode15(this._input.substring(index8, this._offset), index8, elements3);
              this._offset = this._offset;
            }
            extend(address0, this._types.MustacheNode);
            if (address0 === FAILURE) {
              this._offset = index1;
              var index10 = this._offset, elements4 = new Array(2);
              var address9 = FAILURE;
              address9 = this._read_partial_node();
              if (address9 !== FAILURE) {
                elements4[0] = address9;
                var address10 = FAILURE;
                var index11 = this._offset;
                address10 = this._read_whitespace();
                if (address10 === FAILURE) {
                  address10 = new TreeNode(this._input.substring(index11, index11), index11);
                  this._offset = index11;
                }
                if (address10 !== FAILURE) {
                  elements4[1] = address10;
                } else {
                  elements4 = null;
                  this._offset = index10;
                }
              } else {
                elements4 = null;
                this._offset = index10;
              }
              if (elements4 === null) {
                address0 = FAILURE;
              } else {
                address0 = new TreeNode16(this._input.substring(index10, this._offset), index10, elements4);
                this._offset = this._offset;
              }
              extend(address0, this._types.MustacheNode);
              if (address0 === FAILURE) {
                this._offset = index1;
              }
            }
          }
        }
      }
      this._cache._mustache_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_variable_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._variable_node = this._cache._variable_node || {};
      var cached = this._cache._variable_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset;
      address0 = this._read_regular_variable_node();
      if (address0 === FAILURE) {
        this._offset = index1;
        address0 = this._read_escaped_variable_node();
        if (address0 === FAILURE) {
          this._offset = index1;
        }
      }
      this._cache._variable_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_regular_variable_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._regular_variable_node = this._cache._regular_variable_node || {};
      var cached = this._cache._regular_variable_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(6);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 2);
      }
      if (chunk0 === '{{') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
        this._offset = this._offset + 2;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"{{"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_var_name();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index3 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index3, index3), index3);
              this._offset = index3;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var chunk1 = null;
              if (this._offset < this._inputSize) {
                chunk1 = this._input.substring(this._offset, this._offset + 2);
              }
              if (chunk1 === '}}') {
                address5 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
                this._offset = this._offset + 2;
              } else {
                address5 = FAILURE;
                if (this._offset > this._failure) {
                  this._failure = this._offset;
                  this._expected = [];
                }
                if (this._offset === this._failure) {
                  this._expected.push('"}}"');
                }
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
                var address6 = FAILURE;
                var index4 = this._offset;
                address6 = this._read_whitespace();
                if (address6 === FAILURE) {
                  address6 = new TreeNode(this._input.substring(index4, index4), index4);
                  this._offset = index4;
                }
                if (address6 !== FAILURE) {
                  elements0[5] = address6;
                } else {
                  elements0 = null;
                  this._offset = index1;
                }
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode17(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._regular_variable_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_escaped_variable_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._escaped_variable_node = this._cache._escaped_variable_node || {};
      var cached = this._cache._escaped_variable_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = new Array(5);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 3);
      }
      if (chunk0 === '{{&') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
        this._offset = this._offset + 3;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"{{&"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index3 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index3, index3), index3);
          this._offset = index3;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_var_name();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index4 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index4, index4), index4);
              this._offset = index4;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var chunk1 = null;
              if (this._offset < this._inputSize) {
                chunk1 = this._input.substring(this._offset, this._offset + 2);
              }
              if (chunk1 === '}}') {
                address5 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
                this._offset = this._offset + 2;
              } else {
                address5 = FAILURE;
                if (this._offset > this._failure) {
                  this._failure = this._offset;
                  this._expected = [];
                }
                if (this._offset === this._failure) {
                  this._expected.push('"}}"');
                }
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
              } else {
                elements0 = null;
                this._offset = index2;
              }
            } else {
              elements0 = null;
              this._offset = index2;
            }
          } else {
            elements0 = null;
            this._offset = index2;
          }
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode18(this._input.substring(index2, this._offset), index2, elements0);
        this._offset = this._offset;
      }
      if (address0 === FAILURE) {
        this._offset = index1;
        var index5 = this._offset, elements1 = new Array(6);
        var address6 = FAILURE;
        var chunk2 = null;
        if (this._offset < this._inputSize) {
          chunk2 = this._input.substring(this._offset, this._offset + 3);
        }
        if (chunk2 === '{{{') {
          address6 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
          this._offset = this._offset + 3;
        } else {
          address6 = FAILURE;
          if (this._offset > this._failure) {
            this._failure = this._offset;
            this._expected = [];
          }
          if (this._offset === this._failure) {
            this._expected.push('"{{{"');
          }
        }
        if (address6 !== FAILURE) {
          elements1[0] = address6;
          var address7 = FAILURE;
          var index6 = this._offset;
          address7 = this._read_whitespace();
          if (address7 === FAILURE) {
            address7 = new TreeNode(this._input.substring(index6, index6), index6);
            this._offset = index6;
          }
          if (address7 !== FAILURE) {
            elements1[1] = address7;
            var address8 = FAILURE;
            address8 = this._read_var_name();
            if (address8 !== FAILURE) {
              elements1[2] = address8;
              var address9 = FAILURE;
              var index7 = this._offset;
              address9 = this._read_whitespace();
              if (address9 === FAILURE) {
                address9 = new TreeNode(this._input.substring(index7, index7), index7);
                this._offset = index7;
              }
              if (address9 !== FAILURE) {
                elements1[3] = address9;
                var address10 = FAILURE;
                var chunk3 = null;
                if (this._offset < this._inputSize) {
                  chunk3 = this._input.substring(this._offset, this._offset + 3);
                }
                if (chunk3 === '}}}') {
                  address10 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
                  this._offset = this._offset + 3;
                } else {
                  address10 = FAILURE;
                  if (this._offset > this._failure) {
                    this._failure = this._offset;
                    this._expected = [];
                  }
                  if (this._offset === this._failure) {
                    this._expected.push('"}}}"');
                  }
                }
                if (address10 !== FAILURE) {
                  elements1[4] = address10;
                  var address11 = FAILURE;
                  var index8 = this._offset;
                  address11 = this._read_whitespace();
                  if (address11 === FAILURE) {
                    address11 = new TreeNode(this._input.substring(index8, index8), index8);
                    this._offset = index8;
                  }
                  if (address11 !== FAILURE) {
                    elements1[5] = address11;
                  } else {
                    elements1 = null;
                    this._offset = index5;
                  }
                } else {
                  elements1 = null;
                  this._offset = index5;
                }
              } else {
                elements1 = null;
                this._offset = index5;
              }
            } else {
              elements1 = null;
              this._offset = index5;
            }
          } else {
            elements1 = null;
            this._offset = index5;
          }
        } else {
          elements1 = null;
          this._offset = index5;
        }
        if (elements1 === null) {
          address0 = FAILURE;
        } else {
          address0 = new TreeNode19(this._input.substring(index5, this._offset), index5, elements1);
          this._offset = this._offset;
        }
        if (address0 === FAILURE) {
          this._offset = index1;
        }
      }
      this._cache._escaped_variable_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_section_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._section_node = this._cache._section_node || {};
      var cached = this._cache._section_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(3);
      var address1 = FAILURE;
      address1 = this._read_open_section_node();
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 0, index2 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          address3 = this._read_expr_node();
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index2, this._offset), index2, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address4 = FAILURE;
          address4 = this._read_close_section_node();
          if (address4 !== FAILURE) {
            elements0[2] = address4;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = this._actions.validate_mustache(this._input, index1, this._offset, elements0);
        this._offset = this._offset;
      }
      this._cache._section_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_open_section_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._open_section_node = this._cache._open_section_node || {};
      var cached = this._cache._open_section_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(6);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 3);
      }
      if (chunk0 === '{{#') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
        this._offset = this._offset + 3;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"{{#"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_var_name();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index3 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index3, index3), index3);
              this._offset = index3;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var chunk1 = null;
              if (this._offset < this._inputSize) {
                chunk1 = this._input.substring(this._offset, this._offset + 2);
              }
              if (chunk1 === '}}') {
                address5 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
                this._offset = this._offset + 2;
              } else {
                address5 = FAILURE;
                if (this._offset > this._failure) {
                  this._failure = this._offset;
                  this._expected = [];
                }
                if (this._offset === this._failure) {
                  this._expected.push('"}}"');
                }
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
                var address6 = FAILURE;
                var index4 = this._offset;
                address6 = this._read_whitespace();
                if (address6 === FAILURE) {
                  address6 = new TreeNode(this._input.substring(index4, index4), index4);
                  this._offset = index4;
                }
                if (address6 !== FAILURE) {
                  elements0[5] = address6;
                } else {
                  elements0 = null;
                  this._offset = index1;
                }
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode21(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._open_section_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_close_section_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._close_section_node = this._cache._close_section_node || {};
      var cached = this._cache._close_section_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(6);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 3);
      }
      if (chunk0 === '{{/') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
        this._offset = this._offset + 3;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"{{/"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_var_name();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index3 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index3, index3), index3);
              this._offset = index3;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var chunk1 = null;
              if (this._offset < this._inputSize) {
                chunk1 = this._input.substring(this._offset, this._offset + 2);
              }
              if (chunk1 === '}}') {
                address5 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
                this._offset = this._offset + 2;
              } else {
                address5 = FAILURE;
                if (this._offset > this._failure) {
                  this._failure = this._offset;
                  this._expected = [];
                }
                if (this._offset === this._failure) {
                  this._expected.push('"}}"');
                }
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
                var address6 = FAILURE;
                var index4 = this._offset;
                address6 = this._read_whitespace();
                if (address6 === FAILURE) {
                  address6 = new TreeNode(this._input.substring(index4, index4), index4);
                  this._offset = index4;
                }
                if (address6 !== FAILURE) {
                  elements0[5] = address6;
                } else {
                  elements0 = null;
                  this._offset = index1;
                }
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode22(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._close_section_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_inverted_section_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._inverted_section_node = this._cache._inverted_section_node || {};
      var cached = this._cache._inverted_section_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(3);
      var address1 = FAILURE;
      address1 = this._read_open_inverted_section_node();
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 0, index2 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          address3 = this._read_expr_node();
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index2, this._offset), index2, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address4 = FAILURE;
          address4 = this._read_close_section_node();
          if (address4 !== FAILURE) {
            elements0[2] = address4;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = this._actions.validate_mustache(this._input, index1, this._offset, elements0);
        this._offset = this._offset;
      }
      this._cache._inverted_section_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_open_inverted_section_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._open_inverted_section_node = this._cache._open_inverted_section_node || {};
      var cached = this._cache._open_inverted_section_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(6);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 3);
      }
      if (chunk0 === '{{^') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
        this._offset = this._offset + 3;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"{{^"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_var_name();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index3 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index3, index3), index3);
              this._offset = index3;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var chunk1 = null;
              if (this._offset < this._inputSize) {
                chunk1 = this._input.substring(this._offset, this._offset + 2);
              }
              if (chunk1 === '}}') {
                address5 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
                this._offset = this._offset + 2;
              } else {
                address5 = FAILURE;
                if (this._offset > this._failure) {
                  this._failure = this._offset;
                  this._expected = [];
                }
                if (this._offset === this._failure) {
                  this._expected.push('"}}"');
                }
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
                var address6 = FAILURE;
                var index4 = this._offset;
                address6 = this._read_whitespace();
                if (address6 === FAILURE) {
                  address6 = new TreeNode(this._input.substring(index4, index4), index4);
                  this._offset = index4;
                }
                if (address6 !== FAILURE) {
                  elements0[5] = address6;
                } else {
                  elements0 = null;
                  this._offset = index1;
                }
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode24(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._open_inverted_section_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_commented_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._commented_node = this._cache._commented_node || {};
      var cached = this._cache._commented_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(6);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 3);
      }
      if (chunk0 === '{{!') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
        this._offset = this._offset + 3;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"{{!"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_text_node();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index3 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index3, index3), index3);
              this._offset = index3;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var chunk1 = null;
              if (this._offset < this._inputSize) {
                chunk1 = this._input.substring(this._offset, this._offset + 2);
              }
              if (chunk1 === '}}') {
                address5 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
                this._offset = this._offset + 2;
              } else {
                address5 = FAILURE;
                if (this._offset > this._failure) {
                  this._failure = this._offset;
                  this._expected = [];
                }
                if (this._offset === this._failure) {
                  this._expected.push('"}}"');
                }
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
                var address6 = FAILURE;
                var index4 = this._offset;
                address6 = this._read_whitespace();
                if (address6 === FAILURE) {
                  address6 = new TreeNode(this._input.substring(index4, index4), index4);
                  this._offset = index4;
                }
                if (address6 !== FAILURE) {
                  elements0[5] = address6;
                } else {
                  elements0 = null;
                  this._offset = index1;
                }
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode25(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._commented_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_partial_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._partial_node = this._cache._partial_node || {};
      var cached = this._cache._partial_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(6);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 3);
      }
      if (chunk0 === '{{>') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 3), this._offset);
        this._offset = this._offset + 3;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"{{>"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var index2 = this._offset;
        address2 = this._read_whitespace();
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(index2, index2), index2);
          this._offset = index2;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address3 = FAILURE;
          address3 = this._read_path_node();
          if (address3 !== FAILURE) {
            elements0[2] = address3;
            var address4 = FAILURE;
            var index3 = this._offset;
            address4 = this._read_whitespace();
            if (address4 === FAILURE) {
              address4 = new TreeNode(this._input.substring(index3, index3), index3);
              this._offset = index3;
            }
            if (address4 !== FAILURE) {
              elements0[3] = address4;
              var address5 = FAILURE;
              var chunk1 = null;
              if (this._offset < this._inputSize) {
                chunk1 = this._input.substring(this._offset, this._offset + 2);
              }
              if (chunk1 === '}}') {
                address5 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
                this._offset = this._offset + 2;
              } else {
                address5 = FAILURE;
                if (this._offset > this._failure) {
                  this._failure = this._offset;
                  this._expected = [];
                }
                if (this._offset === this._failure) {
                  this._expected.push('"}}"');
                }
              }
              if (address5 !== FAILURE) {
                elements0[4] = address5;
                var address6 = FAILURE;
                var index4 = this._offset;
                address6 = this._read_whitespace();
                if (address6 === FAILURE) {
                  address6 = new TreeNode(this._input.substring(index4, index4), index4);
                  this._offset = index4;
                }
                if (address6 !== FAILURE) {
                  elements0[5] = address6;
                } else {
                  elements0 = null;
                  this._offset = index1;
                }
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode26(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._partial_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_text_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._text_node = this._cache._text_node || {};
      var cached = this._cache._text_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var remaining0 = 1, index1 = this._offset, elements0 = [], address1 = true;
      while (address1 !== FAILURE) {
        var index2 = this._offset, elements1 = new Array(2);
        var address2 = FAILURE;
        var index3 = this._offset;
        var chunk0 = null;
        if (this._offset < this._inputSize) {
          chunk0 = this._input.substring(this._offset, this._offset + 2);
        }
        if (chunk0 === '{{') {
          address2 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
          this._offset = this._offset + 2;
        } else {
          address2 = FAILURE;
          if (this._offset > this._failure) {
            this._failure = this._offset;
            this._expected = [];
          }
          if (this._offset === this._failure) {
            this._expected.push('"{{"');
          }
        }
        this._offset = index3;
        if (address2 === FAILURE) {
          address2 = new TreeNode(this._input.substring(this._offset, this._offset), this._offset);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements1[0] = address2;
          var address3 = FAILURE;
          var index4 = this._offset, elements2 = new Array(2);
          var address4 = FAILURE;
          var index5 = this._offset;
          var chunk1 = null;
          if (this._offset < this._inputSize) {
            chunk1 = this._input.substring(this._offset, this._offset + 2);
          }
          if (chunk1 === '}}') {
            address4 = new TreeNode(this._input.substring(this._offset, this._offset + 2), this._offset);
            this._offset = this._offset + 2;
          } else {
            address4 = FAILURE;
            if (this._offset > this._failure) {
              this._failure = this._offset;
              this._expected = [];
            }
            if (this._offset === this._failure) {
              this._expected.push('"}}"');
            }
          }
          this._offset = index5;
          if (address4 === FAILURE) {
            address4 = new TreeNode(this._input.substring(this._offset, this._offset), this._offset);
            this._offset = this._offset;
          } else {
            address4 = FAILURE;
          }
          if (address4 !== FAILURE) {
            elements2[0] = address4;
            var address5 = FAILURE;
            var chunk2 = null;
            if (this._offset < this._inputSize) {
              chunk2 = this._input.substring(this._offset, this._offset + 1);
            }
            if (chunk2 !== null && /^[^<>]/.test(chunk2)) {
              address5 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
              this._offset = this._offset + 1;
            } else {
              address5 = FAILURE;
              if (this._offset > this._failure) {
                this._failure = this._offset;
                this._expected = [];
              }
              if (this._offset === this._failure) {
                this._expected.push('[^<>]');
              }
            }
            if (address5 !== FAILURE) {
              elements2[1] = address5;
            } else {
              elements2 = null;
              this._offset = index4;
            }
          } else {
            elements2 = null;
            this._offset = index4;
          }
          if (elements2 === null) {
            address3 = FAILURE;
          } else {
            address3 = new TreeNode(this._input.substring(index4, this._offset), index4, elements2);
            this._offset = this._offset;
          }
          if (address3 !== FAILURE) {
            elements1[1] = address3;
          } else {
            elements1 = null;
            this._offset = index2;
          }
        } else {
          elements1 = null;
          this._offset = index2;
        }
        if (elements1 === null) {
          address1 = FAILURE;
        } else {
          address1 = new TreeNode(this._input.substring(index2, this._offset), index2, elements1);
          this._offset = this._offset;
        }
        if (address1 !== FAILURE) {
          elements0.push(address1);
          --remaining0;
        }
      }
      if (remaining0 <= 0) {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      } else {
        address0 = FAILURE;
      }
      extend(address0, this._types.TextNode);
      this._cache._text_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_path_node: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._path_node = this._cache._path_node || {};
      var cached = this._cache._path_node[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var remaining0 = 1, index1 = this._offset, elements0 = [], address1 = true;
      while (address1 !== FAILURE) {
        var chunk0 = null;
        if (this._offset < this._inputSize) {
          chunk0 = this._input.substring(this._offset, this._offset + 1);
        }
        if (chunk0 !== null && /^[_a-zA-Z0-9\\\-\/\.]/.test(chunk0)) {
          address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
          this._offset = this._offset + 1;
        } else {
          address1 = FAILURE;
          if (this._offset > this._failure) {
            this._failure = this._offset;
            this._expected = [];
          }
          if (this._offset === this._failure) {
            this._expected.push('[_a-zA-Z0-9\\\\\\-\\/\\.]');
          }
        }
        if (address1 !== FAILURE) {
          elements0.push(address1);
          --remaining0;
        }
      }
      if (remaining0 <= 0) {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      } else {
        address0 = FAILURE;
      }
      this._cache._path_node[index0] = [address0, this._offset];
      return address0;
    },

    _read_var_name: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._var_name = this._cache._var_name || {};
      var cached = this._cache._var_name[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(2);
      var address1 = FAILURE;
      var index2 = this._offset;
      address1 = this._read_letter();
      this._offset = index2;
      if (address1 !== FAILURE) {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset), this._offset);
        this._offset = this._offset;
      } else {
        address1 = FAILURE;
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 0, index3 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          address3 = this._read_dot_alphanum();
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index3, this._offset), index3, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._var_name[index0] = [address0, this._offset];
      return address0;
    },

    _read_dashed_var_name: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._dashed_var_name = this._cache._dashed_var_name || {};
      var cached = this._cache._dashed_var_name[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(2);
      var address1 = FAILURE;
      var index2 = this._offset;
      address1 = this._read_letter();
      this._offset = index2;
      if (address1 !== FAILURE) {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset), this._offset);
        this._offset = this._offset;
      } else {
        address1 = FAILURE;
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 0, index3 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          address3 = this._read_dash_alphanum();
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index3, this._offset), index3, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._dashed_var_name[index0] = [address0, this._offset];
      return address0;
    },

    _read_letter: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._letter = this._cache._letter || {};
      var cached = this._cache._letter[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 1);
      }
      if (chunk0 !== null && /^[_a-zA-Z]/.test(chunk0)) {
        address0 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
        this._offset = this._offset + 1;
      } else {
        address0 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('[_a-zA-Z]');
        }
      }
      this._cache._letter[index0] = [address0, this._offset];
      return address0;
    },

    _read_dot_alphanum: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._dot_alphanum = this._cache._dot_alphanum || {};
      var cached = this._cache._dot_alphanum[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(2);
      var address1 = FAILURE;
      var index2 = this._offset;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 1);
      }
      if (chunk0 === '.') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
        this._offset = this._offset + 1;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"."');
        }
      }
      if (address1 === FAILURE) {
        address1 = new TreeNode(this._input.substring(index2, index2), index2);
        this._offset = index2;
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 1, index3 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          var chunk1 = null;
          if (this._offset < this._inputSize) {
            chunk1 = this._input.substring(this._offset, this._offset + 1);
          }
          if (chunk1 !== null && /^[_a-zA-Z0-9]/.test(chunk1)) {
            address3 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
            this._offset = this._offset + 1;
          } else {
            address3 = FAILURE;
            if (this._offset > this._failure) {
              this._failure = this._offset;
              this._expected = [];
            }
            if (this._offset === this._failure) {
              this._expected.push('[_a-zA-Z0-9]');
            }
          }
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index3, this._offset), index3, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._dot_alphanum[index0] = [address0, this._offset];
      return address0;
    },

    _read_dash_alphanum: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._dash_alphanum = this._cache._dash_alphanum || {};
      var cached = this._cache._dash_alphanum[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(2);
      var address1 = FAILURE;
      var index2 = this._offset;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 1);
      }
      if (chunk0 === '-') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
        this._offset = this._offset + 1;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"-"');
        }
      }
      if (address1 === FAILURE) {
        address1 = new TreeNode(this._input.substring(index2, index2), index2);
        this._offset = index2;
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 1, index3 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          var chunk1 = null;
          if (this._offset < this._inputSize) {
            chunk1 = this._input.substring(this._offset, this._offset + 1);
          }
          if (chunk1 !== null && /^[_a-zA-Z0-9]/.test(chunk1)) {
            address3 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
            this._offset = this._offset + 1;
          } else {
            address3 = FAILURE;
            if (this._offset > this._failure) {
              this._failure = this._offset;
              this._expected = [];
            }
            if (this._offset === this._failure) {
              this._expected.push('[_a-zA-Z0-9]');
            }
          }
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index3, this._offset), index3, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      }
      this._cache._dash_alphanum[index0] = [address0, this._offset];
      return address0;
    },

    _read_sq_string_literal: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._sq_string_literal = this._cache._sq_string_literal || {};
      var cached = this._cache._sq_string_literal[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(3);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 1);
      }
      if (chunk0 === '\'') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
        this._offset = this._offset + 1;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"\'"');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 0, index2 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          var index3 = this._offset;
          var remaining1 = 1, index4 = this._offset, elements2 = [], address4 = true;
          while (address4 !== FAILURE) {
            var chunk1 = null;
            if (this._offset < this._inputSize) {
              chunk1 = this._input.substring(this._offset, this._offset + 1);
            }
            if (chunk1 !== null && /^[^'\\{]/.test(chunk1)) {
              address4 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
              this._offset = this._offset + 1;
            } else {
              address4 = FAILURE;
              if (this._offset > this._failure) {
                this._failure = this._offset;
                this._expected = [];
              }
              if (this._offset === this._failure) {
                this._expected.push('[^\'\\\\{]');
              }
            }
            if (address4 !== FAILURE) {
              elements2.push(address4);
              --remaining1;
            }
          }
          if (remaining1 <= 0) {
            address3 = new TreeNode(this._input.substring(index4, this._offset), index4, elements2);
            this._offset = this._offset;
          } else {
            address3 = FAILURE;
          }
          if (address3 === FAILURE) {
            this._offset = index3;
            address3 = this._read_mustache_node();
            if (address3 === FAILURE) {
              this._offset = index3;
            }
          }
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index2, this._offset), index2, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address5 = FAILURE;
          var chunk2 = null;
          if (this._offset < this._inputSize) {
            chunk2 = this._input.substring(this._offset, this._offset + 1);
          }
          if (chunk2 === '\'') {
            address5 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
            this._offset = this._offset + 1;
          } else {
            address5 = FAILURE;
            if (this._offset > this._failure) {
              this._failure = this._offset;
              this._expected = [];
            }
            if (this._offset === this._failure) {
              this._expected.push('"\'"');
            }
          }
          if (address5 !== FAILURE) {
            elements0[2] = address5;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = this._actions.removeQuotes(this._input, index1, this._offset, elements0);
        this._offset = this._offset;
      }
      this._cache._sq_string_literal[index0] = [address0, this._offset];
      return address0;
    },

    _read_dq_string_literal: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._dq_string_literal = this._cache._dq_string_literal || {};
      var cached = this._cache._dq_string_literal[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var index1 = this._offset, elements0 = new Array(3);
      var address1 = FAILURE;
      var chunk0 = null;
      if (this._offset < this._inputSize) {
        chunk0 = this._input.substring(this._offset, this._offset + 1);
      }
      if (chunk0 === '"') {
        address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
        this._offset = this._offset + 1;
      } else {
        address1 = FAILURE;
        if (this._offset > this._failure) {
          this._failure = this._offset;
          this._expected = [];
        }
        if (this._offset === this._failure) {
          this._expected.push('"\\""');
        }
      }
      if (address1 !== FAILURE) {
        elements0[0] = address1;
        var address2 = FAILURE;
        var remaining0 = 0, index2 = this._offset, elements1 = [], address3 = true;
        while (address3 !== FAILURE) {
          var index3 = this._offset;
          var remaining1 = 1, index4 = this._offset, elements2 = [], address4 = true;
          while (address4 !== FAILURE) {
            var chunk1 = null;
            if (this._offset < this._inputSize) {
              chunk1 = this._input.substring(this._offset, this._offset + 1);
            }
            if (chunk1 !== null && /^[^"\\{]/.test(chunk1)) {
              address4 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
              this._offset = this._offset + 1;
            } else {
              address4 = FAILURE;
              if (this._offset > this._failure) {
                this._failure = this._offset;
                this._expected = [];
              }
              if (this._offset === this._failure) {
                this._expected.push('[^"\\\\{]');
              }
            }
            if (address4 !== FAILURE) {
              elements2.push(address4);
              --remaining1;
            }
          }
          if (remaining1 <= 0) {
            address3 = new TreeNode(this._input.substring(index4, this._offset), index4, elements2);
            this._offset = this._offset;
          } else {
            address3 = FAILURE;
          }
          if (address3 === FAILURE) {
            this._offset = index3;
            address3 = this._read_mustache_node();
            if (address3 === FAILURE) {
              this._offset = index3;
            }
          }
          if (address3 !== FAILURE) {
            elements1.push(address3);
            --remaining0;
          }
        }
        if (remaining0 <= 0) {
          address2 = new TreeNode(this._input.substring(index2, this._offset), index2, elements1);
          this._offset = this._offset;
        } else {
          address2 = FAILURE;
        }
        if (address2 !== FAILURE) {
          elements0[1] = address2;
          var address5 = FAILURE;
          var chunk2 = null;
          if (this._offset < this._inputSize) {
            chunk2 = this._input.substring(this._offset, this._offset + 1);
          }
          if (chunk2 === '"') {
            address5 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
            this._offset = this._offset + 1;
          } else {
            address5 = FAILURE;
            if (this._offset > this._failure) {
              this._failure = this._offset;
              this._expected = [];
            }
            if (this._offset === this._failure) {
              this._expected.push('"\\""');
            }
          }
          if (address5 !== FAILURE) {
            elements0[2] = address5;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0 === null) {
        address0 = FAILURE;
      } else {
        address0 = this._actions.removeQuotes(this._input, index1, this._offset, elements0);
        this._offset = this._offset;
      }
      this._cache._dq_string_literal[index0] = [address0, this._offset];
      return address0;
    },

    _read_whitespace: function() {
      var address0 = FAILURE, index0 = this._offset;
      this._cache._whitespace = this._cache._whitespace || {};
      var cached = this._cache._whitespace[index0];
      if (cached) {
        this._offset = cached[1];
        return cached[0];
      }
      var remaining0 = 1, index1 = this._offset, elements0 = [], address1 = true;
      while (address1 !== FAILURE) {
        var chunk0 = null;
        if (this._offset < this._inputSize) {
          chunk0 = this._input.substring(this._offset, this._offset + 1);
        }
        if (chunk0 !== null && /^[ \s]/.test(chunk0)) {
          address1 = new TreeNode(this._input.substring(this._offset, this._offset + 1), this._offset);
          this._offset = this._offset + 1;
        } else {
          address1 = FAILURE;
          if (this._offset > this._failure) {
            this._failure = this._offset;
            this._expected = [];
          }
          if (this._offset === this._failure) {
            this._expected.push('[ \\s]');
          }
        }
        if (address1 !== FAILURE) {
          elements0.push(address1);
          --remaining0;
        }
      }
      if (remaining0 <= 0) {
        address0 = new TreeNode(this._input.substring(index1, this._offset), index1, elements0);
        this._offset = this._offset;
      } else {
        address0 = FAILURE;
      }
      this._cache._whitespace[index0] = [address0, this._offset];
      return address0;
    }
  };

  var Parser = function(input, actions, types) {
    this._input = input;
    this._inputSize = input.length;
    this._actions = actions;
    this._types = types;
    this._offset = 0;
    this._cache = {};
    this._failure = 0;
    this._expected = [];
  };

  Parser.prototype.parse = function() {
    var tree = this._read_dom_node();
    if (tree !== FAILURE && this._offset === this._inputSize) {
      return tree;
    }
    if (this._expected.length === 0) {
      this._failure = this._offset;
      this._expected.push('<EOF>');
    }
    this.constructor.lastError = {offset: this._offset, expected: this._expected};
    throw new SyntaxError(formatError(this._input, this._failure, this._expected));
  };

  var parse = function(input, options) {
    options = options || {};
    var parser = new Parser(input, options.actions, options.types);
    return parser.parse();
  };
  extend(Parser.prototype, Grammar);

  var exported = {Grammar: Grammar, Parser: Parser, parse: parse};

  if (typeof require === 'function' && typeof exports === 'object') {
    extend(exports, exported);
  } else {
    var namespace = typeof this !== 'undefined' ? this : window;
    namespace.Schwartzman = exported;
  }
})();
