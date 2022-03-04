import path from "path";
import { fileURLToPath } from "url";
import pkt from "../../src/cli/builtins/pkt.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import ImplicitModulesTransform from "../../src/node/ImplicitModulesTransform.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesGraph = new (ImplicitModulesTransform(ExplorableFiles))(
  fixturesDirectory
);

describe("pkt (pika template)", () => {
  it("substitutes values from the supplied graph", async () => {
    const template = await fixturesGraph.get("inline.pkt");
    const result = await pkt.call(fixturesGraph, template);
    const normalized = result.toString().replace(/\r\n/g, "\n");
    assert.equal(
      normalized,
      `This is a template containing substitutions.

Hello, world.

Hello, Alice.
`
    );
  });
});
