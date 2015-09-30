module.exports = function(content) {
  this.cacheable();
  return `
    module.exports = function (p) {
      return [${JSON.stringify(content)}, p]
    }
  `
};
