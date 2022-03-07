import path from "path";
import { fileURLToPath } from "url";
import orit from "../../src/builtins/orit.js";
import ExplorableFiles from "../../src/node/ExplorableFiles.js";
import ImplicitModulesTransform from "../../src/node/ImplicitModulesTransform.js";
import assert from "../assert.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDirectory = path.join(dirname, "fixtures");
const fixturesGraph = new (ImplicitModulesTransform(ExplorableFiles))(
  fixturesDirectory
);

describe("orit (apply Origami template)", () => {
  it("substitutes values from the supplied graph", async () => {
    const template = await fixturesGraph.get("inline.ori");
    const result = await orit.call(fixturesGraph, template);
    const normalized = result?.toString().replace(/\r\n/g, "\n");
    assert.equal(
      normalized,
      `This is a template containing substitutions.

Hello, world.

`
    );
  });
});
