import assert from "node:assert";
import { describe, test } from "node:test";
import * as compile from "../../src/compiler/compile.js";
import { assertCodeEqual } from "./codeHelpers.js";

const globals = {
  concat: (...args) => args.join(""),
  greet: (name) => `Hello, ${name}!`,
  name: "Alice",
};

/**
 * More complex tests for the compile() function
 *
 * The evaluate2.test.js file contains more basic tests, covering more language
 * features, which compare the output of evaluate2() against an expected result.
 */
describe("compile", () => {

  test("async object", async () => {
    const fn = compile.expression("{ a: { b = name }}", { globals });
    const object = await fn();
    assert.deepEqual(await object.a.b, "Alice");
  });

  test("lambda", async () => {
    const fn = compile.expression("(name) => greet(name)", { globals });
    const lambda = await fn();
    const result = await lambda("Bob");
    assert.equal(result, "Hello, Bob!");
  });

  test("lambda with default parameter", async () => {
    const fn = compile.expression("(name = 'Guest') => greet(name)", {
      globals,
    });
    const lambda = await fn();
    const result1 = await lambda();
    assert.equal(result1, "Hello, Guest!");
    const result2 = await lambda("Bob");
    assert.equal(result2, "Hello, Bob!");
  });

  test("lambda with rest parameter", async () => {
    const fn = compile.expression("(head, ...rest) => { head, rest }", {
      globals,
    });
    const lambda = await fn();
    const result = await lambda(1, 2, 3, 4);
    assert.deepEqual(result, { head: 1, rest: [2, 3, 4] });
  });

  test("lambda with object destructuring", async () => {
    const fn = compile.expression("({ name, ...rest }) => { name, rest }", {
      globals,
    });
    const lambda = await fn();
    const result = await lambda({ name: "Bob", age: 30, city: "New York" });
    assert.deepEqual(result, {
      name: "Bob",
      rest: { age: 30, city: "New York" },
    });
  });

  test("templateDocument", async () => {
    const defineTemplateFn = compile.templateDocument(
      "Documents can contain ` backticks",
    );
    const templateFn = await defineTemplateFn();
    const value = await templateFn();
    assert.deepEqual(value, "Documents can contain ` backticks");
  });

  test("tagged template string array is identical across calls", async () => {
    let saved;
    const globals = {
      tag: (strings, ...values) => {
        assertCodeEqual(strings, ["Hello, ", "!"]);
        if (saved) {
          assert.deepEqual(strings, saved);
        } else {
          saved = strings;
        }
        return strings[0] + values[0] + strings[1];
      },
    };
    const program = compile.expression("(_) => tag`Hello, ${_}!`", { globals });
    const lambda = await program();
    const alice = await lambda("Alice");
    assert.equal(alice, "Hello, Alice!");
    const bob = await lambda("Bob");
    assert.equal(bob, "Hello, Bob!");
  });
});
