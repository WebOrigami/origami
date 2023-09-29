import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import TextWithContents from "../../src/common/TextWithContents.js";

describe.only("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `Hello, {{name}}!`;
    const inlined = await inline.call(scope, text);
    assert.equal(inlined, "Hello, Alice!");
  });

  test.only("can reference keys in an attached graph", async () => {
    const textFile = new TextWithContents(`Hello, {{ @template/name }}!`, {
      name: "Bob",
    });
    const inlined = await inline.call(null, textFile);
    assert.equal(String(inlined), `Hello, Bob!`);
  });
});
