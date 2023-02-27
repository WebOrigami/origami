import { tokenType } from "../../src/language/lex.js";
import * as ops from "../../src/language/ops.js";
import {
  args,
  array,
  assignment,
  expression,
  functionComposition,
  getReference,
  graph,
  graphDocument,
  group,
  lambda,
  list,
  number,
  object,
  objectProperty,
  objectPropertyOrShorthand,
  percentCall,
  percentPath,
  protocolCall,
  slashCall,
  slashPath,
  string,
  substitution,
  templateDocument,
  templateLiteral,
  termSeparator,
  urlProtocolCall,
  whitespace,
} from "../../src/language/parse.js";
import assert from "../assert.js";

describe.only("parse", () => {
  it.skip("args", () => {
    assertParse(args(" a, b, c"), [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse(args("(a, b, c)"), [
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.scope, "c"],
    ]);
    assertParse(args("()"), []);
    assert.equal(args(""), null);
  });

  it.only("array", () => {
    assertParse(
      array([
        { type: tokenType.LEFT_BRACKET },
        { type: tokenType.RIGHT_BRACKET },
      ]),
      [ops.array]
    );
    assertParse(
      array([
        { type: tokenType.LEFT_BRACKET },
        { type: tokenType.NUMBER, lexeme: "1" },
        { type: tokenType.SEPARATOR },
        { type: tokenType.NUMBER, lexeme: "2" },
        { type: tokenType.SEPARATOR },
        { type: tokenType.NUMBER, lexeme: "3" },
        { type: tokenType.RIGHT_BRACKET },
      ]),
      [ops.array, 1, 2, 3]
    );
  });

  it.only("assignment", () => {
    assertParse(
      assignment([
        {
          type: tokenType.REFERENCE,
          lexeme: "data",
        },
        { type: tokenType.EQUALS },
        { type: tokenType.REFERENCE, lexeme: "obj.json" },
      ]),
      [ops.assign, "data", [ops.scope, "obj.json"]]
    );
    // assertParse(assignment("foo = fn 'bar'"), [
    //   ops.assign,
    //   "foo",
    //   [[ops.scope, "fn"], "bar"],
    // ]);
  });

  it.only("expression", () => {
    assertParse(
      expression([{ type: tokenType.REFERENCE, lexeme: "obj.json" }]),
      [ops.scope, "obj.json"]
    );
    // assertParse(expression("(fn a, b, c)"), [
    //   [ops.scope, "fn"],
    //   [ops.scope, "a"],
    //   [ops.scope, "b"],
    //   [ops.scope, "c"],
    // ]);
    // assertParse(expression("foo.bar( 'hello' , 'world' )"), [
    //   [ops.scope, "foo.bar"],
    //   "hello",
    //   "world",
    // ]);
    // assertParse(expression("(fn)('a')"), [[ops.scope, "fn"], "a"]);
    assertParse(expression([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
    // assert.equal(expression("(foo"), null);
    // assertParse(expression("{ a:1, b:2 }"), [ops.object, { a: 1, b: 2 }]);
    // assertParse(expression("serve { index.html: 'hello' }"), [
    //   [ops.scope, "serve"],
    //   [ops.object, { "index.html": "hello" }],
    // ]);
  });

  it.skip("expression with function with space-separated arguments, mixed argument types", () => {
    assertParse(expression(`copy app(formulas), files 'snapshot'`), [
      [ops.scope, "copy"],
      [
        [ops.scope, "app"],
        [ops.scope, "formulas"],
      ],
      [[ops.scope, "files"], "snapshot"],
    ]);
  });

  it.skip("functionComposition", () => {
    assertParse(functionComposition("fn()"), [[ops.scope, "fn"]]);
    assertParse(functionComposition("fn('arg')"), [[ops.scope, "fn"], "arg"]);
    assertParse(functionComposition("fn('a', 'b')"), [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assertParse(functionComposition("fn 'a', 'b'"), [
      [ops.scope, "fn"],
      "a",
      "b",
    ]);
    assertParse(functionComposition("fn a, b"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    // A call with implicit parentheses can't span newlines.
    assertParse(functionComposition("fn\na, b"), null);
    assertParse(functionComposition("fn(\n  a\n  b\n)"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse(functionComposition("fn a(b), c"), [
      [ops.scope, "fn"],
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
      ],
      [ops.scope, "c"],
    ]);
    assertParse(functionComposition("fn1 fn2 'arg'"), [
      [ops.scope, "fn1"],
      [[ops.scope, "fn2"], "arg"],
    ]);
    assertParse(functionComposition("fn a, b, { c:1 }"), [
      [ops.scope, "fn"],
      [ops.scope, "a"],
      [ops.scope, "b"],
      [ops.object, { c: 1 }],
    ]);
  });

  it.skip("functionComposition indirect", () => {
    assertParse(functionComposition("(fn()) 'arg'"), [
      [[ops.scope, "fn"]],
      "arg",
    ]);
    assertParse(functionComposition("(fn()) (a, b)"), [
      [[ops.scope, "fn"]],
      [ops.scope, "a"],
      [ops.scope, "b"],
    ]);
    assertParse(functionComposition("fn('a')('b')"), [
      [[ops.scope, "fn"], "a"],
      "b",
    ]);
    assert.equal(functionComposition("(fn())"), null);
  });

  it.only("getReference", () => {
    assertParse(
      getReference([{ type: tokenType.REFERENCE, lexeme: "hello" }]),
      [ops.scope, "hello"]
    );
  });

  it.skip("graph", () => {
    assertParse(graph("{}"), [ops.graph, {}]);
    assertParse(graph("{ x = fn('a') }"), [
      ops.graph,
      {
        x: [[ops.scope, "fn"], "a"],
      },
    ]);
    assertParse(graph("{ a=1 \n x=fn('a') }"), [
      ops.graph,
      {
        a: 1,
        x: [[ops.scope, "fn"], "a"],
      },
    ]);
  });

  it.skip("graphDocument", () => {
    assertParse(graphDocument(""), [ops.graph, {}]);
    assertParse(graphDocument("# Comment"), [ops.graph, {}]);
    assertParse(graphDocument("a = 1, b = 2"), [ops.graph, { a: 1, b: 2 }]);
    assertParse(graphDocument("a = 1\nb = 2"), [ops.graph, { a: 1, b: 2 }]);
    assertParse(graphDocument("a = 1\nb"), [
      ops.graph,
      { a: 1, b: [ops.inherited, "b"] },
    ]);
  });

  it.only("group", () => {
    assertParse(
      group([
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.REFERENCE, lexeme: "hello" },
        { type: tokenType.RIGHT_PAREN },
      ]),
      [ops.scope, "hello"]
    );
    assertParse(
      group([
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.LEFT_PAREN },
        { type: tokenType.REFERENCE, lexeme: "nested" },
        { type: tokenType.RIGHT_PAREN },
        { type: tokenType.RIGHT_PAREN },
        { type: tokenType.RIGHT_PAREN },
      ]),
      [ops.scope, "nested"]
    );
    // assertParse(group("(fn())"), [[ops.scope, "fn"]]);
    // assert.equal(group("("), null);
  });

  it.skip("lambda", () => {
    assertParse(lambda("= message"), [ops.lambda, [ops.scope, "message"]]);
    assertParse(lambda("=`Hello, {{name}}.`"), [
      ops.lambda,
      [ops.concat, "Hello, ", [ops.scope, "name"], "."],
    ]);
  });

  it.only("list", () => {
    assertParse(list([]), []);
    assertParse(list([{ type: tokenType.REFERENCE, lexeme: "a" }]), [
      [ops.scope, "a"],
    ]);
    assertParse(
      list([
        { type: tokenType.REFERENCE, lexeme: "a" },
        { type: tokenType.SEPARATOR },
        { type: tokenType.REFERENCE, lexeme: "b" },
        { type: tokenType.SEPARATOR },
        { type: tokenType.REFERENCE, lexeme: "c" },
      ]),
      [
        [ops.scope, "a"],
        [ops.scope, "b"],
        [ops.scope, "c"],
      ]
    );
  });

  it.only("number", () => {
    assertParse(number([{ type: tokenType.NUMBER, lexeme: "1" }]), 1);
  });

  it.only("object", () => {
    // "{ a: 1, b }"
    assertParse(
      object([
        { type: tokenType.LEFT_BRACE },
        { type: tokenType.REFERENCE, lexeme: "a" },
        { type: tokenType.COLON },
        { type: tokenType.NUMBER, lexeme: "1" },
        { type: tokenType.SEPARATOR },
        { type: tokenType.REFERENCE, lexeme: "b" },
        { type: tokenType.RIGHT_BRACE },
      ]),
      [
        ops.object,
        {
          a: 1,
          b: [ops.inherited, "b"],
        },
      ]
    );
  });

  it.only("objectProperty", () => {
    assertParse(
      objectProperty([
        { type: tokenType.REFERENCE, lexeme: "a" },
        { type: tokenType.COLON },
        { type: tokenType.NUMBER, lexeme: "1" },
      ]),
      { a: 1 }
    );
    assertParse(
      objectProperty([
        { type: tokenType.REFERENCE, lexeme: "name" },
        { type: tokenType.COLON },
        { type: tokenType.STRING, lexeme: "Alice" },
      ]),
      { name: "Alice" }
    );
    // assertParse(objectProperty("x : fn('a')"), { x: [[ops.scope, "fn"], "a"] });
  });

  it.only("objectPropertyOrShorthand", () => {
    assertParse(
      objectPropertyOrShorthand([{ type: tokenType.REFERENCE, lexeme: "foo" }]),
      {
        foo: [ops.inherited, "foo"],
      }
    );
  });

  it.skip("percentCall", () => {
    assertParse(percentCall("graph%"), [ops.scope, "graph", undefined]);
    assertParse(percentCall("graph%foo%bar"), [
      ops.scope,
      "graph",
      "foo",
      "bar",
    ]);
  });

  it.skip("percentPath", () => {
    assertParse(percentPath("foo%bar%baz"), ["foo", "bar", "baz"]);
    assertParse(percentPath("foo%bar%baz%"), ["foo", "bar", "baz", undefined]);
  });

  it.skip("protocolCall", () => {
    assertParse(protocolCall("foo://bar"), [[ops.scope, "foo"], "bar"]);
    assertParse(protocolCall("fn:/a/b"), [[ops.scope, "fn"], "a", "b"]);
  });

  it.skip("slashCall", () => {
    assertParse(slashCall("graph/"), [ops.scope, "graph", undefined]);
    assertParse(slashCall("graph/foo/bar"), [ops.scope, "graph", "foo", "bar"]);
    assertParse(slashCall("//foo/bar"), [ops.scope, "foo", "bar"]);
    assertParse(slashCall("a/b/c.txt"), [ops.scope, "a", "b", "c.txt"]);
  });

  it.skip("slashPath", () => {
    assertParse(slashPath("foo/bar/baz"), ["foo", "bar", "baz"]);
    assertParse(slashPath("foo/bar/baz/"), ["foo", "bar", "baz", undefined]);
  });

  it.skip("slashCalls with functions", () => {
    assertParse(expression("fn()/key"), [[[ops.scope, "fn"]], "key"]);
    assertParse(expression("(fn())/key"), [[[ops.scope, "fn"]], "key"]);
    assertParse(slashCall("fn('a', 'b')/c/d"), [
      [[ops.scope, "fn"], "a", "b"],
      "c",
      "d",
    ]);
    assertParse(expression("graph/key()"), [[ops.scope, "graph", "key"]]);
    assertParse(expression("fn1()/fn2()"), [[[[ops.scope, "fn1"]], "fn2"]]);
  });

  it("string", () => {
    assertParse(string([{ type: tokenType.STRING, lexeme: "Hello" }]), "Hello");
  });

  it.skip("substitution", () => {
    assertParse(substitution("{{foo}}"), [ops.scope, "foo"]);
  });

  it.skip("templateDocument", () => {
    assertParse(
      templateDocument("Documents can contain ` backticks"),
      "Documents can contain ` backticks"
    );

    assertParse(
      templateDocument(`{{fn =\`
        Hello
      \` }}`),
      [
        ops.concat,
        [
          [ops.scope, "fn"],
          [ops.lambda, "        Hello\n"],
        ],
      ]
    );

    assertParse(
      templateDocument(`Start
  {{fn =\`
    Block contents
  \`}}
End`),
      [
        ops.concat,
        "Start\n",
        [
          [ops.scope, "fn"],
          [ops.lambda, "    Block contents\n"],
        ],
        "End",
      ]
    );

    assertParse(
      templateDocument(`
\`\`\`md
{{ sample.md }}
\`\`\`
`),
      [ops.concat, "\n```md\n", [ops.scope, "sample.md"], "\n```\n"]
    );

    assertParse(
      templateDocument(`
  <ul>
  {{ map names, =\`
    <li>{{ @value }}</li>
  \`}}
  </ul>
`),
      [
        ops.concat,
        "\n  <ul>\n",
        [
          [ops.scope, "map"],
          [ops.scope, "names"],
          [
            ops.lambda,
            [ops.concat, "    <li>", [ops.scope, "@value"], "</li>\n"],
          ],
        ],
        "  </ul>\n",
      ]
    );
  });

  it.skip("templateLiteral", () => {
    assertParse(templateLiteral("`Hello, world.`"), "Hello, world.");
    assertParse(templateLiteral("`foo { bar } baz`"), "foo { bar } baz");
    assertParse(
      templateLiteral("`escape characters with \\`backslash\\``"),
      "escape characters with `backslash`"
    );
  });

  it.skip("templateLiteral with substitution", () => {
    assertParse(templateLiteral("``"), "");
    assertParse(templateLiteral("`{{x}}.json`"), [
      ops.concat,
      [ops.scope, "x"],
      ".json",
    ]);
    assertParse(templateLiteral("`foo {{x}}.json bar`"), [
      ops.concat,
      "foo ",
      [ops.scope, "x"],
      ".json bar",
    ]);
    assertParse(templateLiteral("`foo {{ fn(a) }} bar`"), [
      ops.concat,
      "foo ",
      [
        [ops.scope, "fn"],
        [ops.scope, "a"],
      ],
      " bar",
    ]);
    assertParse(templateLiteral("`{{`nested`}}`"), "nested");
    assertParse(templateLiteral("`{{map(people, =`{{name}}`)}}`"), [
      ops.concat,
      [
        [ops.scope, "map"],
        [ops.scope, "people"],
        [ops.lambda, [ops.concat, [ops.scope, "name"]]],
      ],
    ]);
  });

  it.skip("termSeparator", () => {
    assertParse(termSeparator(","), true);
    assertParse(termSeparator("   ,"), true);
    assertParse(termSeparator(" # Comment\n   ,"), true);
    assertParse(termSeparator("\n"), true);
    assertParse(termSeparator(" # Comment\n# More comment \n"), true);
  });

  it.skip("urlProtocolCall", () => {
    assertParse(urlProtocolCall("https://example.com/foo/"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      undefined,
    ]);
    assertParse(urlProtocolCall("https://example.com/foo/bar.json"), [
      [ops.scope, "https"],
      "example.com",
      "foo",
      "bar.json",
    ]);
    assertParse(urlProtocolCall("https:example.com"), [
      [ops.scope, "https"],
      "example.com",
    ]);
  });

  it.skip("urlProtocolCall with functionComposition", () => {
    assertParse(expression("https://example.com/graph.yaml 'key'"), [
      [[ops.scope, "https"], "example.com", "graph.yaml"],
      "key",
    ]);
  });

  it.skip("whitespace", () => {
    assert.deepEqual(whitespace("   hello"), {
      value: true,
      rest: "hello",
    });
    assert.deepEqual(whitespace("\n# Comment\n3"), {
      value: true,
      rest: "3",
    });
    assert.deepEqual(whitespace("# Comment"), {
      value: true,
      rest: "",
    });
  });
});

function assertParse(parseResult, expected) {
  if (expected === null) {
    assert.isNull(parseResult);
  } else {
    assert(parseResult);
    assert.deepEqual(parseResult, {
      value: expected,
      rest: [],
    });
  }
}
