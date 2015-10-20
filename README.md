# schwartzman

Webpack loader for [Mustache](https://mustache.github.io). Compiles jsx.mustache files to [ReactJS](https://facebook.github.io/react).

For example, this template:

```mustache
<!-- tmpl.jsx.mustache -->
<div>
  <b class=x>{{name}}</b>
  <i data-x="x"></i>
</div>
```

compiles to this:

```js
module.exports = function (props) {
  return (
    React.DOM.div(
      {},
      React.DOM.b(
        {"className":"x"},
        props.name
      ),
      React.DOM.i({"data-x":"x"})
    )
  )
}
```

## usage
Add in your webpack.config.js
* `{test: /\.jsx\.mustache$/, loader: "schwartzman"}` to `module.loaders`
* `'.jsx.mustache'` to `resolve.extensions`

```js
module.exports = {
  entry: {
    // ...
  },
  output: {
    // ...
  },
  module: {
    loaders: [
      // ...
      {test: /\.jsx\.mustache$/, loader: "schwartzman"},
    ],
  },
  resolve: {
    extensions: [
      // ...
      '.jsx.mustache',
    ],
    // ...
  }
  // ...
}
```

## setup
```bash
$ npm i
$ make # make examples
```

## TODO
* [ ] compatability with React 0.14 (separated ReactDOM module)
* [ ] DOM events handlers (onClick, onFocus, etc.) `<div {{#onClick}}onClick={{f}}{{/onClick}}`
* [ ] style parsing (`style="margin-top: 20px"` => `"style": {"marginTop": "20px"}`)
