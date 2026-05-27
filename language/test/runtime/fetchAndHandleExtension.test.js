import assert from "node:assert";
import { describe, test } from "node:test";
import json_handler from "../../src/handlers/json_handler.js";
import fetchAndHandleExtension from "../../src/protocols/fetchAndHandleExtension.js";

describe("fetchAndHandleExtension", () => {
  test("can unpack based on MIME content type", async () => {
    /** @type {any} */
    const parent = new Map();
    parent.globals = {
      json_handler,
    };
    const buffer = await fetchAndHandleExtension(
      "https://weborigami.org/samples/help/pet.json",
      null,
      {
        parent,
      },
    );
    const data = await buffer.unpack();
    assert.strictEqual(data.name, "Fluffy");
  });
});
