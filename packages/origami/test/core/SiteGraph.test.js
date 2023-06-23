import assert from "node:assert";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import SiteGraph from "../../src/core/SiteGraph.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const siteDirectory = path.join(fixturesDirectory, "temp");
// Sadly, a local file: URL won't work; need a way to reliably test or mock an
// http/https call.
const localSiteUrl = pathToFileURL(siteDirectory);

describe.skip("SiteGraph", () => {
  test("can get keys at a given route", async () => {
    const graph = new SiteGraph(localSiteUrl.href);
    const keys = Array.from(await graph.keys());
    assert.deepEqual(keys, ["hello.txt"]);
  });
});
