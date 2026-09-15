import assert from "node:assert";
import { describe, test } from "node:test";
import json_handler from "../../src/handlers/json_handler.js";
import fetchAndHandleExtension from "../../src/protocols/fetchAndHandleExtension.js";
import executionContext from "../../src/runtime/executionContext.js";

describe("fetchAndHandleExtension", () => {
  test("can unpack based on MIME content type", async () => {
    /** @type {any} */
    const parent = new Map();
    parent.globals = {
      json_handler,
    };
    const context = {
      parent,
    };
    const buffer = await executionContext.run(
      context,
      async () =>
        await fetchAndHandleExtension(
          "https://weborigami.org/samples/help/pet.json",
        ),
    );
    // @ts-ignore
    const data = await buffer.unpack();
    assert.strictEqual(data.name, "Fluffy");
  });
});
