import { Graph, ObjectGraph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import inline from "../../src/builtins/@inline.js";
import TextFile from "../../src/common/TextFile.js";

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
    const textFile = new TextFile(`---
name: Bob
---
Hello, {{ @attached/name }}!`);
    const inlinedFile = await inline.call(null, textFile);
    assert.equal(
      String(inlinedFile),
      `---
name: Bob
---
Hello, Bob!`
    );
    assert.equal(inlinedFile.bodyText, `Hello, Bob!`);
    const graph = await inlinedFile.contents();
    assert.deepEqual(await Graph.plain(graph), {
      name: "Bob",
    });
  });
});
