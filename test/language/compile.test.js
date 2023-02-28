import builtins from "../../src/cli/builtins.js";
import * as compile from "../../src/language/compile.js";
import assert from "../assert.js";

describe.only("compile", () => {
  // it.skip("array", () => {
  //   assertParse(array("[]"), [ops.array]);
  //   assertParse(array("[ 1, 2, 3, ]"), [ops.array, 1, 2, 3]);
  // });

  // it.skip("graph", () => {
  //   assertParse(
  //     graph([{ type: tokenType.LEFT_BRACE }, { type: tokenType.RIGHT_BRACE }]),
  //     [ops.graph, {}]
  //   );
  //   assertParse(graph("{ x = fn('a') }"), [
  //     ops.graph,
  //     {
  //       x: [[ops.scope, "fn"], "a"],
  //     },
  //   ]);
  //   assertParse(graph("{ a=1 \n x=fn('a') }"), [
  //     ops.graph,
  //     {
  //       a: 1,
  //       x: [[ops.scope, "fn"], "a"],
  //     },
  //   ]);
  // });

  // it.skip("graphDocument", () => {
  //   assertParse(graphDocument(""), [ops.graph, {}]);
  //   assertParse(graphDocument("# Comment"), [ops.graph, {}]);
  //   assertParse(graphDocument("a = 1, b = 2"), [ops.graph, { a: 1, b: 2 }]);
  //   assertParse(graphDocument("a = 1\nb = 2"), [ops.graph, { a: 1, b: 2 }]);
  //   assertParse(graphDocument("a = 1\nb"), [
  //     ops.graph,
  //     { a: 1, b: [ops.inherited, "b"] },
  //   ]);
  // });

  it("number", async () => {
    await assertCompile("1", 1);
    await assertCompile("3.14159", 3.14159);
    await assertCompile("-1", -1);
  });

  it("list", async () => {
    // assertParse(list(""), []);
    // assertParse(list(" a"), [[ops.scope, "a"]]);
    // assertParse(list(" a , b,c, d , e"), [
    //   [ops.scope, "a"],
    //   [ops.scope, "b"],
    //   [ops.scope, "c"],
    //   [ops.scope, "d"],
    //   [ops.scope, "e"],
    // ]);
    // assertParse(list("a\nb\nc"), [
    //   [ops.scope, "a"],
    //   [ops.scope, "b"],
    //   [ops.scope, "c"],
    // ]);
    // assertParse(list("a, # Comment\nb"), [
    //   [ops.scope, "a"],
    //   [ops.scope, "b"],
    // ]);
    // assertParse(list("a(b), c"), [
    //   [
    //     [ops.scope, "a"],
    //     [ops.scope, "b"],
    //   ],
    //   [ops.scope, "c"],
    // ]);
  });

  // it.only("object", () => {
  //   assertParse(object("{a:1, b:2}"), [ops.object, { a: 1, b: 2 }]);
  //   assertParse(object("{\n  a:1\n  b:2\n}"), [ops.object, { a: 1, b: 2 }]);
  //   assertParse(object("{ a: { b: { c: 0 } } }"), [
  //     ops.object,
  //     {
  //       a: [ops.object, { b: [ops.object, { c: 0 }] }],
  //     },
  //   ]);
  //   assertParse(object("{ a: 1, b }"), [
  //     ops.object,
  //     {
  //       a: 1,
  //       b: [ops.inherited, "b"],
  //     },
  //   ]);
  // });

  // it.skip("objectProperty", () => {
  //   assertParse(objectProperty("a: 1"), { a: 1 });
  //   assertParse(objectProperty("name:'Alice'"), { name: "Alice" });
  //   assertParse(objectProperty("x : fn('a')"), { x: [[ops.scope, "fn"], "a"] });
  // });

  //   it.skip("templateDocument", () => {
  //     assertParse(
  //       templateDocument("Documents can contain ` backticks"),
  //       "Documents can contain ` backticks"
  //     );

  //     assertParse(
  //       templateDocument(`{{fn =\`
  //         Hello
  //       \` }}`),
  //       [
  //         ops.concat,
  //         [
  //           [ops.scope, "fn"],
  //           [ops.lambda, "        Hello\n"],
  //         ],
  //       ]
  //     );

  //     assertParse(
  //       templateDocument(`Start
  //   {{fn =\`
  //     Block contents
  //   \`}}
  // End`),
  //       [
  //         ops.concat,
  //         "Start\n",
  //         [
  //           [ops.scope, "fn"],
  //           [ops.lambda, "    Block contents\n"],
  //         ],
  //         "End",
  //       ]
  //     );

  //     assertParse(
  //       templateDocument(`
  // \`\`\`md
  // {{ sample.md }}
  // \`\`\`
  // `),
  //       [ops.concat, "\n```md\n", [ops.scope, "sample.md"], "\n```\n"]
  //     );

  //     assertParse(
  //       templateDocument(`
  //   <ul>
  //   {{ map names, =\`
  //     <li>{{ @value }}</li>
  //   \`}}
  //   </ul>
  // `),
  //       [
  //         ops.concat,
  //         "\n  <ul>\n",
  //         [
  //           [ops.scope, "map"],
  //           [ops.scope, "names"],
  //           [
  //             ops.lambda,
  //             [ops.concat, "    <li>", [ops.scope, "@value"], "</li>\n"],
  //           ],
  //         ],
  //         "  </ul>\n",
  //       ]
  //     );
  //   });

  // it.only("templateLiteral", () => {
  //   assertParse(
  //     templateLiteral([
  //       { type: tokenType.BACKTICK },
  //       { type: tokenType.STRING, lexeme: "Hello, world." },
  //       { type: tokenType.BACKTICK },
  //     ]),
  //     "Hello, world."
  //   );
  //   // assertParse(templateLiteral("`foo { bar } baz`"), "foo { bar } baz");
  //   // assertParse(
  //   //   templateLiteral("`escape characters with \\`backslash\\``"),
  //   //   "escape characters with `backslash`"
  //   // );
  // });

  // it.skip("templateLiteral with substitution", () => {
  //   assertParse(templateLiteral("``"), "");
  //   assertParse(templateLiteral("`{{x}}.json`"), [
  //     ops.concat,
  //     [ops.scope, "x"],
  //     ".json",
  //   ]);
  //   assertParse(templateLiteral("`foo {{x}}.json bar`"), [
  //     ops.concat,
  //     "foo ",
  //     [ops.scope, "x"],
  //     ".json bar",
  //   ]);
  //   assertParse(templateLiteral("`foo {{ fn(a) }} bar`"), [
  //     ops.concat,
  //     "foo ",
  //     [
  //       [ops.scope, "fn"],
  //       [ops.scope, "a"],
  //     ],
  //     " bar",
  //   ]);
  //   assertParse(templateLiteral("`{{`nested`}}`"), "nested");
  //   assertParse(templateLiteral("`{{map(people, =`{{name}}`)}}`"), [
  //     ops.concat,
  //     [
  //       [ops.scope, "map"],
  //       [ops.scope, "people"],
  //       [ops.lambda, [ops.concat, [ops.scope, "name"]]],
  //     ],
  //   ]);
  // });
});

async function assertCompile(text, expected) {
  const fn = compile.expression(text);
  const result = await fn.call(builtins);
  assert.deepEqual(result, expected);
}
