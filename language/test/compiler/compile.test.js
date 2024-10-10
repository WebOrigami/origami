import { ObjectTree, symbols, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";

const shared = new ObjectTree({
  greet: (name) => `Hello, ${name}!`,
  name: "Alice",
});

describe.only("compile", () => {
  test("array", async () => {
    await assertCompile("[]", []);
    await assertCompile("[ 1, 2, 3, ]", [1, 2, 3]);
    await assertCompile("[\n'a'\n'b'\n'c'\n]", ["a", "b", "c"]);
  });

  test("functionComposition", async () => {
    await assertCompile("greet()", "Hello, undefined!");
    await assertCompile("greet(name)", "Hello, Alice!");
    await assertCompile("greet 'world'", "Hello, world!");
  });

  test("tree", async () => {
    const fn = compile.expression("{ message = greet(name) }");
    const tree = await fn.call(null);
    tree[symbols.parent] = shared;
    assert.deepEqual(await Tree.plain(tree), {
      message: "Hello, Alice!",
    });
  });

  test("number", async () => {
    await assertCompile("1", 1);
    await assertCompile("3.14159", 3.14159);
    await assertCompile("-1", -1);
  });

  test("sync object", async () => {
    await assertCompile("{a:1, b:2}", { a: 1, b: 2 });
    await assertCompile("{ a: { b: { c: 0 } } }", { a: { b: { c: 0 } } });
  });

  test("async object", async () => {
    const fn = compile.expression("{ a: { b = name }}");
    const object = await fn.call(shared);
    assert.deepEqual(await object["a/"].b, "Alice");
  });

  test("templateDocument", async () => {
    const fn = compile.templateDocument("Documents can contain ` backticks");
    const templateFn = await fn.call(shared);
    const value = await templateFn.call(null);
    assert.deepEqual(value, "Documents can contain ` backticks");
  });

  test("templateLiteral", async () => {
    await assertCompile("`Hello, ${name}!`", "Hello, Alice!");
    await assertCompile(
      "`escape characters with \\`backslash\\``",
      "escape characters with `backslash`"
    );
  });

  test.only("templateLiteral block with whitespace", () => {
    // Test the preprocessor that trims whitespace around template blocks
    const text = `  \${ if(\`
    true text
  \`, \`
    false text
  \`) }`;
    const fn = compile.templateDocument(text);
    const { code } = fn;
    const ifCall = code[2][2];
    const trueText = ifCall[1][1];
    const falseText = ifCall[2][1];
    assert.equal(trueText, "    true text\n");
    assert.equal(falseText, "    false text\n");
  });

  test.only("consecutive templateLiteral blocks", () => {
    const text = `\${a}
    \${b}`;
    const fn = compile.templateDocument(text);
    const { code } = fn;
    const part = code[2][2][1];
    assert.equal(part, "\n    ");
  });
});

async function assertCompile(text, expected) {
  const fn = compile.expression(text);
  const result = await fn.call(shared);
  assert.deepEqual(result, expected);
}
