"use strict";

var assert = require("assert");
var schwartzman = require("../dist/schwartzman").bind({
  cacheble: function() {},
  query:
    '?{prelude: "var h = function () {}", requireName: "../dist/schwartzman"}'
});
var LL = require("../dist/schwartzman").lowLevel;
var rt = require("../dist/schwartzman").runtime;

function parse(tmpl) {
  return LL.PEGparse(tmpl, { actions: LL.PEGactions, types: LL.PEGtypes });
}

function parseAndCompile(tmpl, v) {
  v = v || {};
  if (v.__plainScopeNames == undefined) {
    v.__plainScopeNames = true;
  }
  return LL.compileAny(parse(tmpl).elements[0], v).code.replace(/\s*$/, "");
}

describe("schwartzman", function() {
  describe("compileAttrs", function() {
    it("empty arg returns an object", function() {
      assert.deepEqual(LL.compileAttrs({ varName: "props" }, "", {}), "");
    });

    it("correctly prepare ordinary attrs", function() {
      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          name: { text: "x" },
          value: { text: "x" }
        }),
        '"x":"x"'
      );
    });

    it("correctly prepare name-only attrs", function() {
      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          name: { text: "x" }
        }),
        '"x":true'
      );
    });

    it("correctly prepare `class` attr", function() {
      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          name: { text: "class" },
          value: { text: "x" }
        }),
        '"className":"x"'
      );
    });

    it("correctly prepare `style` attr", function() {
      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          name: { text: "style" },
          value: { text: "width: 200px" }
        }),
        '"style":{"width":"200px"}'
      );

      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          name: { text: "style" },
          value: { text: "border-radius: 5px" }
        }),
        '"style":{"borderRadius":"5px"}'
      );

      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          name: { text: "style" },
          value: {
            text:
              "background-image: url(http://example.com/image.png); color: black"
          }
        }),
        '"style":{"backgroundImage":"url(http://example.com/image.png)","color":"black"}'
      );

      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          name: { text: "style" },
          value: { text: "color: black;" }
        }),
        '"style":{"color":"black"}'
      );
    });
  });

  describe("compileAttrs: mustache", function() {
    it("correctly prepare section attr", function() {
      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          attr_section_node: {
            var_name: "x",
            expr_node: { text: "y" }
          },
          _type: "MustacheNode"
        }),
        '"y": !!props.x'
      );
    });

    it("correctly prepare inverted section attr", function() {
      assert.deepEqual(
        LL.compileAttrs({ varName: "props" }, "", {
          attr_inverted_section_node: {
            var_name: "x",
            expr_node: { text: "y" }
          },
          _type: "MustacheNode"
        }),
        '"y": !props.x'
      );
    });
  });

  describe("parse", function() {
    it("syntax errors: dom tree", function() {
      assert.throws(parse.bind(null, "<p><b></p></b>"), /SyntaxError/);
      assert.throws(parse.bind(null, "<p><img></p>"), /SyntaxError/);
      assert.throws(parse.bind(null, "<p><</p>"), /SyntaxError/);
      assert.throws(parse.bind(null, "<p>></p>"), /SyntaxError/);
      assert.throws(parse.bind(null, "<p %></p>"), /SyntaxError/);
      assert.throws(parse.bind(null, "<p>"), /SyntaxError/);
    });

    it('syntax errors: "single escaped child" limitation', function() {
      assert.throws(
        parse.bind(null, "<p>{{{ one }}}{{{ two }}}</p>"),
        /SyntaxError/
      );
      assert.throws(
        parse.bind(null, "<p>{{& one }}{{{ two }}}</p>"),
        /SyntaxError/
      );
      assert.throws(
        parse.bind(null, "<p>{{{ one }}}{{& two }}</p>"),
        /SyntaxError/
      );
      assert.throws(parse.bind(null, "<p>{{{ one }}}text</p>"), /SyntaxError/);
    });

    it("mustache: multicase vars", function() {
      assert.doesNotThrow(parse.bind(null, "<p>{{{ one }}}</p>"));
      assert.doesNotThrow(parse.bind(null, "<p>{{{ ONE }}}</p>"));
      assert.doesNotThrow(parse.bind(null, "<p>{{{ oNe }}}</p>"));
    });

    it("multiple nodes in root", function() {
      assert.notEqual(
        schwartzman("").match(
          /module.exports = function \(props\) { return null }/
        ),
        null
      );

      assert.notEqual(
        schwartzman("{{name}}").match(
          /module.exports = function \(props\) { return \(props.name\) }/
        ),
        null
      );

      assert.notEqual(
        schwartzman("{{id}}{{name}}").match(
          /module.exports = function \(props\) { return \[\(props.id\),\(props.name\)\] }/
        ),
        null
      );

      assert.notEqual(
        schwartzman("<img />{{name}}")
          .replace(/\s+/g, "")
          .match(/module.exports=function\(props\){return\[(\(.*\),?)+\]}/),
        null
      );

      assert.notEqual(
        schwartzman("<img /><b />")
          .replace(/\s+/g, "")
          .match(/module.exports=function\(props\){return\[(\(.*\),?)+\]}/),
        null
      );
    });
  });

  describe("compileAny", function() {
    it("compiles single mustache", function() {
      assert.equal(parseAndCompile("{{name}}"), "props.name");
    });
  });

  describe("compileDOM", function() {
    it("compiles single simple node", function() {
      assert.equal(parseAndCompile("<div></div>"), 'h("div", null)');

      assert.equal(parseAndCompile("<textarea/>"), 'h("textarea", null)');

      assert.equal(
        parseAndCompile("<img src='test.jpg'></img>"),
        'h("img", {"src":"test.jpg"})'
      );

      assert.equal(
        parseAndCompile("<span hidden=hidden></span>"),
        'h("span", {"hidden":"hidden"})'
      );

      assert.equal(
        parseAndCompile('<span class="hidden"></span>'),
        'h("span", {"className":"hidden"})'
      );

      assert.equal(
        parseAndCompile("<p>lol</p>", { varName: "props" }).replace(/\s+/g, ""),
        'h("p",null,"lol")'
      );
    });

    it("compiles single node with multiple attrs", function() {
      assert.equal(
        parseAndCompile("<div data-x='x' data-y='y'></div>"),
        'h("div", {"data-x":"x","data-y":"y"})'
      );
    });

    it("compiles nested nodes", function() {
      assert.equal(
        parseAndCompile("<div><img/></div>").replace(/\s+/g, ""),
        'h("div",null,h("img",null))'
      );

      assert.equal(
        parseAndCompile("<div><img/><img/></div>").replace(/\s+/g, ""),
        'h("div",null,h("img",null),h("img",null))'
      );

      assert.equal(
        parseAndCompile("<p>lol<img/></p>").replace(/\s+/g, ""),
        'h("p",null,"lol",h("img",null))'
      );

      assert.equal(
        parseAndCompile("<div><p><img/></p></div>").replace(/\s+/g, ""),
        'h("div",null,h("p",null,h("img",null)))'
      );
    });
  });

  describe("compileMustache[attrs]", function() {
    it("compiles variable node as attr value", function() {
      assert.equal(
        parseAndCompile("<p lol={{lol}}></p>", { varName: "props" }).replace(
          /\s+/g,
          ""
        ),
        'h("p",{"lol":props.lol})'
      );
    });

    it("compiles naked attr value", function() {
      assert.equal(
        parseAndCompile("<p id=a></p>", { varName: "props" }).replace(
          /\s+/g,
          ""
        ),
        'h("p",{"id":"a"})'
      );
    });

    it("compiles variable node inside attr value", function() {
      assert.equal(
        parseAndCompile('<p lol="test {{lol}}"></p>', {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("p",{"lol":"test"+props.lol})' // loses space because of replace inside a test
      );

      assert.equal(
        parseAndCompile('<p lol="test {{lol.lol}}"></p>', {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("p",{"lol":"test"+props.lol.lol})' // loses space because of replace inside a test
      );
    });

    it("compiles variable node inside `style` attr value", function() {
      assert.equal(
        parseAndCompile('<p style="color: red"></p>', {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("p",{"style":{"color":"red"}})' // loses space because of replace inside a test
      );

      assert.equal(
        parseAndCompile("<p style={{kek}}></p>", { varName: "props" }).replace(
          /\s+/g,
          ""
        ),
        'h("p",{"style":rt.' + rt.prepareStyle.name + "(props.kek)})" // loses space because of replace inside a test
      );

      assert.equal(
        parseAndCompile('<p style="{{lol}}"></p>', {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("p",{"style":rt.' + rt.prepareStyle.name + "(props.lol)})" // loses space because of replace inside a test
      );

      assert.equal(
        parseAndCompile('<p style="{{rofl}}; display: inline-block"></p>', {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("p",{"style":rt.' +
          rt.prepareStyle.name +
          '(props.rofl+";display:inline-block")})' // loses space because of replace inside a test
      );
    });

    it("compiles section node inside attr value", function() {
      assert.equal(
        parseAndCompile('<p lol="test {{#lol}}fest{{/lol}}"></p>', {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("p",{"lol":"test"+(rt.' +
          rt.section.name +
          '(h,render,[props],"lol",function(lol){return("fest")},"fest")||\'\')})' // loses space because of replace inside a test
      );
    });

    it("compiles nested section nodes", function() {
      assert.equal(
        parseAndCompile(
          "<div>{{#people}}<input {{#checked}}checked{{/checked}}/>{{/people}}</div>",
          { varName: "props" }
        ).replace(/\s+/g, ""),
        'h("div",null,rt.' +
          rt.section.name +
          '(h,render,[props],"people",function(people){return(h("input",{"checked":!!rt.' +
          rt.scopeSearch.name +
          '([people,props],"checked")}))},"<input{{#checked}}checked{{/checked}}/>"))'
      );
    });
  });

  describe("compileMustache[children]", function() {
    it("compiles variable node", function() {
      assert.equal(
        parseAndCompile("{{lol}}", { varName: "props" }).replace(/\s+/g, ""),
        "props.lol"
      );

      assert.equal(
        parseAndCompile("<p>{{lol}}</p>", { varName: "props" }).replace(
          /\s+/g,
          ""
        ),
        'h("p",null,props.lol)'
      );

      assert.equal(
        parseAndCompile("<p>x{{lol}}</p>", { varName: "props" }).replace(
          /\s+/g,
          ""
        ),
        'h("p",null,"x",props.lol)'
      );

      assert.equal(
        parseAndCompile("<p>{{lol}}x</p>", { varName: "props" }).replace(
          /\s+/g,
          ""
        ),
        'h("p",null,props.lol,"x")'
      );
    });

    it("compiles section node with text inside", function() {
      assert.equal(
        parseAndCompile("{{#people}}x{{/people}}", {
          varName: "props"
        }).replace(/\s+/g, ""),
        "rt." +
          rt.section.name +
          '(h,render,[props],"people",function(people){return("x")},"x")'
      );

      assert.equal(
        parseAndCompile("<p>{{#people}}x{{/people}}</p>", {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("p",null,rt.' +
          rt.section.name +
          '(h,render,[props],"people",function(people){return("x")},"x"))'
      );
    });

    it("compiles section node with mustache inside", function() {
      assert.equal(
        parseAndCompile("<span>{{#people}}{{name}},{{/people}}</span>", {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("span",null,rt.' +
          rt.section.name +
          '(h,render,[props],"people",function(people){return[rt.' +
          rt.scopeSearch.name +
          '([people,props],"name"),","]},"{{name}},"))'
      );
    });

    it("compiles section node with dom inside", function() {
      assert.equal(
        parseAndCompile("<ul>{{#people}}<li>{{name}}</li>{{/people}}</ul>", {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("ul",null,rt.' +
          rt.section.name +
          '(h,render,[props],"people",function(people){return(h("li",null,rt.' +
          rt.scopeSearch.name +
          '([people,props],"name")))},"<li>{{name}}</li>"))'
      );
    });

    it("compiles inverted section node with text inside", function() {
      assert.equal(
        parseAndCompile("<p>{{^people}}x{{/people}}</p>", {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("p",null,rt.' +
          rt.inverted_section.name +
          '([props],"people",function(){return("x")}))'
      );
    });

    it("compiles nested section nodes", function() {
      assert.equal(
        parseAndCompile(
          "<span>{{#people}}{{#phone}}{{local}}{{/phone}}{{/people}}</span>",
          { varName: "props" }
        ).replace(/\s+/g, ""),
        'h("span",null,rt.' +
          rt.section.name +
          '(h,render,[props],"people",function(people){return(rt.' +
          rt.section.name +
          '(h,render,[people,props],"phone",function(phone){return(rt.' +
          rt.scopeSearch.name +
          '([phone,people,props],"local"))},"{{local}}"))},"{{#phone}}{{local}}{{/phone}}"))'
      );
    });

    it("compiles nested inverted section nodes", function() {
      assert.equal(
        parseAndCompile(
          "<span>{{^people}}{{#phone}}{{local}}{{/phone}}{{/people}}</span>",
          { varName: "props" }
        ).replace(/\s+/g, ""),
        'h("span",null,rt.' +
          rt.inverted_section.name +
          '([props],"people",function(){return(rt.' +
          rt.section.name +
          '(h,render,[props],"phone",function(phone){return(rt.' +
          rt.scopeSearch.name +
          '([phone,props],"local"))},"{{local}}"))}))'
      );
    });

    it("compiles comment node", function() {
      assert.equal(
        parseAndCompile("<p>lol{{! comment }}</p>", { varName: "props" })
          .replace(/ +/g, "")
          .replace(/\n\n+/g, "\n"),
        "h(\n" + '"p",\n' + "null\n" + ',"lol"//comment\n' + ")"
      );

      assert.equal(
        parseAndCompile("<p>lol{{! }}</p>", { varName: "props" })
          .replace(/ +/g, "")
          .replace(/\n\n+/g, "\n"),
        "h(\n" + '"p",\n' + "null\n" + ',"lol"//\n' + ")"
      );

      assert.equal(
        parseAndCompile("<p>curlies{{! }\\} }}</p>", { varName: "props" })
          .replace(/ +/g, "")
          .replace(/\n\n+/g, "\n"),
        "h(\n" + '"p",\n' + "null\n" + ',"curlies"//}}\n' + ")"
      );
    });

    it("compiles escaped node", function() {
      assert.equal(
        parseAndCompile("<p>{{{ amp }}}</p>", { varName: "props" }).replace(
          / +/g,
          ""
        ),
        'h("p",{"dangerouslySetInnerHTML":{"__html":props.amp}})'
      );

      assert.equal(
        parseAndCompile("<p>{{& amp }}</p>", { varName: "props" }).replace(
          / +/g,
          ""
        ),
        'h("p",{"dangerouslySetInnerHTML":{"__html":props.amp}})'
      );
    });

    it("compiles partial node", function() {
      assert.equal(
        parseAndCompile("<div>{{> amp.jsx.mustache }}</div>", {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("div",null,rt.' +
          rt.partial_node.name +
          '(h,require("amp.jsx.mustache"),props))'
      );

      assert.equal(
        parseAndCompile("<div>{{#obj}}{{> amp.jsx.mustache }}{{/obj}}</div>", {
          varName: "props"
        }).replace(/\s+/g, ""),
        'h("div",null,rt.' +
          rt.section.name +
          '(h,render,[props],"obj",function(obj){return(rt.' +
          rt.partial_node.name +
          '(h,require("amp.jsx.mustache"),obj))},"{{>amp.jsx.mustache}}"))'
      );
    });
  });

  describe("internals", function() {
    it("preserves whitespaces", function() {
      assert.deepEqual(
        parse("<div>{{x}} words</div>").elements[0].nodes.elements.map(function(
          v
        ) {
          return v.text;
        }),
        ["{{x}}", " words"]
      );

      assert.deepEqual(
        parse("<div>{{x}} </div>").elements[0].nodes.elements.map(function(v) {
          return v.text;
        }),
        ["{{x}}"]
      );

      assert.deepEqual(
        parse("<div>{{x}} {{y}}</div>").elements[0].nodes.elements.map(function(
          v
        ) {
          return v.text;
        }),
        ["{{x}}", " ", "{{y}}"]
      );
    });

    it("prefixes scopes", function() {
      var compiled = parseAndCompile(
        "<div>{{#x}}{{#y}}{{z}}{{/y}}{{/x}}</div>",
        { varName: "props", __plainScopeNames: false }
      );

      assert.equal(compiled.match(/function\(__S_\d+_[a-z0-9_]\)/g).length, 2);

      assert.equal(compiled.search(/function\(__S_\d+_x\)/g) > -1, true);

      assert.equal(compiled.search(/function\(__S_\d+_y\)/g) > -1, true);

      assert.equal(compiled.search(/function\(__S_\d+_[^xy]\)/g) > -1, false);
    });
  });
});
