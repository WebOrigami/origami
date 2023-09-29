import { ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import TextWithContents from "../../src/common/TextWithContents.js";
import loadTextWithFrontMatter from "../../src/common/loadTextWithFrontMatter.js";
describe("inline", () => {
  test("inlines Origami expressions found in input text", async () => {
    const scope = new ObjectGraph({
      name: "Alice",
    });
    const text = `Hello, {{name}}!`;
    const inlined = await inline.call(scope, text);
    assert.equal(inlined, "Hello, Alice!");
  });

  test("can reference keys in an attached graph", async () => {
    const text = new TextWithContents(`Hello, {{ name }}!`, { name: "Bob" });
    const textFile = loadTextWithFrontMatter(null, text);
    const inlined = await inline.call(null, textFile);
    assert.equal(String(inlined), `Hello, Bob!`);
  });
});
