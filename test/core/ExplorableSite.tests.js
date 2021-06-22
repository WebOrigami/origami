import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { ExplorableSite } from "../../exports.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const siteDirectory = path.join(fixturesDirectory, "temp");
// Sadly, a local file: URL won't work; need a way to reliably test or mock an
// http/https call.
const localSiteUrl = pathToFileURL(siteDirectory);

describe.skip("ExplorableSite", () => {
  it("can get keys at a given route", async () => {
    const graph = new ExplorableSite(localSiteUrl.href);
    const keys = await ExplorableGraph.keys(graph);
    assert.deepEqual(keys, ["hello.txt"]);
  });
});
