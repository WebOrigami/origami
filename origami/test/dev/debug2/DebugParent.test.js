import assert from "node:assert";
import { after, before, describe, test } from "node:test";
import DebugParent from "../../../src/dev/debug2/DebugParent.js";

describe("DebugParent", () => {
  let debugParent;

  before(async () => {
    const fixturesPath = new URL("./fixtures", import.meta.url).pathname;
    debugParent = new DebugParent({
      expression: "{ index.html: counter.js() }",
      parentPath: fixturesPath,
      quiet: true,
    });
    await debugParent.start();
  });

  after(() => debugParent.close());

  test("starts a debug server", async () => {
    const response = await fetch(debugParent.origin);
    const text = await response.text();
    assert.equal(text, "0");
    // Expect same response
    const response2 = await fetch(debugParent.origin);
    const text2 = await response2.text();
    assert.equal(text2, "0");
  });

  test("can restart the child server for a Node environment reset", async () => {
    await debugParent.restart();
    const response = await fetch(debugParent.origin);
    const text = await response.text();
    // JS should have reloaded, resetting the counter
    assert.equal(text, "0");
  });
});
