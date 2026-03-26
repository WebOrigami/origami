import assert from "node:assert";
import { after, before, describe, test } from "node:test";
import debugParent from "../../../src/dev/debug2/debugParent.js";

describe("debugParent", () => {
  let server;
  let origin;

  before(async () => {
    const fixturesPath = new URL("./fixtures", import.meta.url).pathname;
    server = await debugParent({
      expression: "{ index.html: counter.js() }",
      parentPath: fixturesPath,
    });
    origin = await new Promise((resolve) => {
      server.once("ready", (event) => resolve(event.origin));
    });
  });

  after(() => server.close());

  test("starts a debug server", async () => {
    const response = await fetch(origin);
    const text = await response.text();
    assert.equal(text, "0");
    // Expect same response
    const response2 = await fetch(origin);
    const text2 = await response2.text();
    assert.equal(text2, "0");
  });

  test("can reevaluate the expression", async () => {
    await server.reevaluate();
    const response = await fetch(origin);
    const text = await response.text();
    assert.equal(text, "1");
  });

  // test("can reevaluate the expression", async () => {
  //   await server.reevaluate();
  //   const response = await fetch(origin);
  //   const text = await response.text();
  //   // JS should have reloaded, resetting the counter
  //   assert.equal(text, "0");
  // });
});
