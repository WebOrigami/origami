import assert from "node:assert";
import { after, before, describe, test } from "node:test";
import debugParent from "../../../src/dev/debug2/debugParent.js";

describe("debugParent", () => {
  let server;

  before(async () => {
    const fixturesPath = new URL("./fixtures", import.meta.url).pathname;
    server = await debugParent({
      expression: "{ index.html: counter.js() }",
      parentPath: fixturesPath,
    });
  });

  after(() => server.close());

  test("starts a debug server", async () => {
    const response = await fetch(server.origin);
    const text = await response.text();
    assert.equal(text, "0");
    // Expect same response
    const response2 = await fetch(server.origin);
    const text2 = await response2.text();
    assert.equal(text2, "0");
  });

  test("can reevaluate the expression", async () => {
    await server.reevaluate();
    const response = await fetch(server.origin);
    const text = await response.text();
    // counter.js should preserve state, index.html should be recalculated
    assert.equal(text, "1");
  });

  test("can restart the child server for a Node environment reset", async () => {
    await server.restart();
    const response = await fetch(server.origin);
    const text = await response.text();
    // JS should have reloaded, resetting the counter
    assert.equal(text, "0");
  });
});
