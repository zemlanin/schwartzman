# schwartzman

Webpack loader for [Mustache](https://mustache.github.io). Compiles jsx.mustache files to [ReactJS](https://facebook.github.io/react).

For example, this template:

```mustache
<!-- tmpl.jsx.mustache -->
<div>
  <b class=x></b>
  <i data-x="x"></i>
</div>
```

compiles to this:

```js
module.exports = function (props) {
  return (
    React.DOM.div(
      {},
      React.DOM.b({"className":"x"}), React.DOM.i({"data-x":"x"})
    )
  )
}
```

## setup
```bash
$ npm i
$ make # make examples
```
