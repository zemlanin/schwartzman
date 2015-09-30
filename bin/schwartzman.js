"use strict";

module.exports = function (content) {
  this.cacheable();
  return "\n    module.exports = function (p) {\n      return [" + JSON.stringify(content) + ", p]\n    }\n  ";
};

