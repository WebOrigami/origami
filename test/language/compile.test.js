import builtins from "../../src/cli/builtins.js";
import * as compile from "../../src/language/compile.js";
import assert from "../assert.js";

describe.only("compile", () => {
  // it.skip("array", () => {
  //   assertParse(array("[]"), [ops.array]);
  //   assertParse(array("[ 1, 2, 3, ]"), [ops.array, 1, 2, 3]);
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
});

async function assertCompile(text, expected) {
  const fn = compile.expression(text);
  const result = await fn.call(builtins);
  assert.deepEqual(result, expected);
}
