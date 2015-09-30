import tmpl from './tmpl.jsx.mustache'

var f = x => x + 1

console.log(tmpl({
  x: 'x',
  l: ['a', 'b', 'c'],
}))
