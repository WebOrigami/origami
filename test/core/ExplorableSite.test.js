import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import SiteGraph from "../../src/core/SiteGraph.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const siteDirectory = path.join(fixturesDirectory, "temp");
// Sadly, a local file: URL won't work; need a way to reliably test or mock an
// http/https call.
const localSiteUrl = pathToFileURL(siteDirectory);

describe.skip("SiteGraph", () => {
  it("can get keys at a given route", async () => {
    const graph = new SiteGraph(localSiteUrl.href);
    const keys = await ExplorableGraph.keys(graph);
    assert.deepEqual(keys, ["hello.txt"]);
  });
});
