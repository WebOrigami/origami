import { ExplorableObject } from "../../exports.js";
import MetaTransform from "../../src/app/MetaTransform.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import { transformObject } from "../../src/core/utilities.js";
import steps from "../../src/eg/commands/steps.js";
import assert from "../assert.js";

describe("steps", () => {
  it("converts an array-like object to a series of named steps", async () => {
    const fixture = steps(["'Hello'", "foo(it)", "bar(it)"]);
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "Step1 = 'Hello'": "",
      "Step2 = foo(Step1)": "",
      "Step3 = bar(Step2)": "",
    });
  });

  it("a steps can be interpreted as a metagraph", async () => {
    const fixture = steps(["'world'", "uppercase(it)", "greet(it)"]);
    const meta = transformObject(MetaTransform, fixture);
    meta.parent = new ExplorableObject({
      greet: (x) => `Hello, ${x}.`,
      uppercase: (x) => x.toUpperCase(),
    });
    assert.equal(await meta.get("Step3"), "Hello, WORLD.");
  });
});
