import { Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import debugTransform from "../../../src/dev/debug2/debugTransform.js";

describe("debugTransform", () => {
  test("adds debug resources", async () => {
    const fixture = debugTransform({
      a: 1,
      more: {
        b: 2,
      },
    });

    // Original resources are still there
    assert.equal(await fixture.get("a"), 1);

    // Debug resources are there
    assert((await fixture.get("index.html")) instanceof String);
    assert.equal(await fixture.get(".keys.json"), '["a","more/"]');

    // Can run commands
    assert.equal(await fixture.get("!keys"), "- a\n- more/\n");

    // Transform applied to subtrees
    assert.equal(await Tree.traverse(fixture, "more", "!keys"), "- b\n");
  });
});
