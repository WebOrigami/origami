import { ObjectMap } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as handlers from "../../src/handlers/handlers.js";
import handleExtension from "../../src/runtime/handleExtension.js";
import OrigamiFileMap from "../../src/runtime/OrigamiFileMap.js";
import systemCache from "../../src/runtime/systemCache.js";

const fixturesUrl = new URL("fixtures/unpack", import.meta.url);
const fixtureFiles = new OrigamiFileMap(fixturesUrl);
fixtureFiles.globals = handlers;

describe("handleExtension", () => {
  test("attaches an unpack method to a value with an extension", async () => {
    const fixture = createFixture();
    const numberValue = await fixture.get("foo");
    assert(typeof numberValue === "number");
    assert.equal(numberValue, 1);
    const jsonFile = await fixture.get("bar.json");
    const globals = {
      json_handler: { unpack: async (data) => JSON.parse(data) },
    };
    const withHandler = handleExtension(jsonFile, "bar.json", globals, fixture);
    assert.equal(String(withHandler), `{ "bar": 2 }`);
    const data = await withHandler.unpack();
    assert.deepEqual(data, { bar: 2 });
  });

  test("tracks dependency on underlying file", async () => {
    systemCache.clear();
    const file = fixtureFiles.get("hello.json");
    const data = await file.unpack();
    assert.equal(data, "Hello");
    const fileEntry = systemCache.get("hello.json");
    const unpackEntry = systemCache.get("hello.json/");
    assert(fileEntry.downstreams.has("hello.json/"));
    assert(unpackEntry.upstreams.has("hello.json"));
  });
});

function createFixture() {
  return new ObjectMap({
    foo: 1, // No extension, should be left alone
    "bar.json": `{ "bar": 2 }`,
  });
}
