import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ObjectGraph from "../../src/core/ObjectGraph.js";
import * as compile from "../../src/language/compile.js";
import assert from "../assert.js";

const scope = new ObjectGraph({
  greet: (name) => `Hello, ${name}!`,
  name: "Alice",
});

describe("compile", () => {
  it("array", async () => {
    await assertCompile("[]", []);
    await assertCompile("[ 1, 2, 3, ]", [1, 2, 3]);
    await assertCompile("[\n'a'\n'b'\n'c'\n]", ["a", "b", "c"]);
  });

  it("functionComposition", async () => {
    await assertCompile("greet()", "Hello, undefined!");
    await assertCompile("greet(name)", "Hello, Alice!");
    await assertCompile("greet 'world'", "Hello, world!");
  });

  it("graph", async () => {
    const fn = compile.expression("{ message = greet(name) }");
    const graph = await fn.call(scope);
    assert.deepEqual(await ExplorableGraph.plain(graph), {
      message: "Hello, Alice!",
    });
  });

  it("number", async () => {
    await assertCompile("1", 1);
    await assertCompile("3.14159", 3.14159);
    await assertCompile("-1", -1);
  });

  it("object", async () => {
    await assertCompile("{a:1, b:2}", { a: 1, b: 2 });
    await assertCompile("{ a: { b: { c: 0 } } }", { a: { b: { c: 0 } } });
  });

  it("templateDocument", async () => {
    const fn = compile.templateDocument("Documents can contain ` backticks");
    const result = await fn.call(scope);
    assert.deepEqual(result, "Documents can contain ` backticks");
  });

  it("templateLiteral", async () => {
    await assertCompile("`Hello, {{name}}!`", "Hello, Alice!");
    await assertCompile(
      "`escape characters with \\`backslash\\``",
      "escape characters with `backslash`"
    );
  });
});

async function assertCompile(text, expected) {
  const fn = compile.expression(text);
  const result = await fn.call(scope);
  assert.deepEqual(result, expected);
}
