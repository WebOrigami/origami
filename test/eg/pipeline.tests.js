import MetaMixin from "../../src/app/MetaMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import { applyMixinToObject } from "../../src/core/utilities.js";
import pipeline from "../../src/eg/commands/pipeline.js";
import assert from "../assert.js";

describe("pipeline", () => {
  it("converts an array-like object to a series of named steps", async () => {
    const fixture = pipeline(["'Hello'", "foo(it)", "bar(it)"]);
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "Step1 = 'Hello'": "",
      "Step2 = foo(Step1)": "",
      "Step3 = bar(Step2)": "",
    });
  });

  it("a pipeline can be interpreted as a metagraph", async () => {
    const fixture = pipeline(["'world'", "uppercase(it)", "greet(it)"]);
    const meta = applyMixinToObject(MetaMixin, fixture);
    meta.scope = new ExplorableObject({
      greet: (x) => `Hello, ${x}.`,
      uppercase: (x) => x.toUpperCase(),
    });
    assert.equal(await meta.get("Step3"), "Hello, WORLD.");
  });
});
