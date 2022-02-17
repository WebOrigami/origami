import path from "path";
import { fileURLToPath } from "url";
import pkt from "../../src/eg/builtins/pkt.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import ImplicitModulesTransform from "../../src/node/ImplicitModulesTransform.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesGraph = new (ImplicitModulesTransform(ExplorableFiles))(
  fixturesDirectory
);

describe("Fixture name goes here", () => {
  it("runs", async () => {
    const template = await fixturesGraph.get("template.pkt");
    const result = await pkt.call(fixturesGraph, template);
    assert.equal(
      result,
      `This is a template containing substitutions.

Hello, world.

Hello, Alice.
`
    );
  });
});
