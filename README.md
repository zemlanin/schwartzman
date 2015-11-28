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
    React.createElement(
      "div",
      null,
      React.createElement(
        "b",
        {"className":"x"},
        props.name
      ),
      React.createElement("i", {"data-x":"x"})
    )
  )
}
```

## why?!
Because "built-in" server-side prerender of react components requires JS VM — JSX allows for pretty complex expressions. On the other hand, almost (?) every language has library for rendering Mustache templates. Plus, Mustache is very simple and basic. So simple, that it's easier to write a Mustache-to-JS compiler than a JSX parser for Python/Perl/PHP/Pascal/P

## installation
```bash
$ npm install --save-dev schwartzman
```

And add to your webpack.config.js
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

## development
```bash
$ npm i
$ make # or `make test` or `make examples`
```
