import MetaMixin from "../../src/app/MetaMixin.js";
import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../../src/core/ExplorableObject.js";
import { applyMixinToObject } from "../../src/core/utilities.js";
import pipeline from "../../src/eg/commands/pipeline.js";
import assert from "../assert.js";

describe.only("pipeline", () => {
  it("converts an array-like object to a series of named steps", async () => {
    const fixture = pipeline(["'Hello'", "foo(it)", "bar(it)"]);
    assert.deepEqual(await ExplorableGraph.plain(fixture), {
      "_step1 = 'Hello'": "",
      "_step2 = foo(_step1)": "",
      "result = bar(_step2)": "",
    });
  });

  it("a pipeline can be interpreted as a metagraph", async () => {
    const fixture = pipeline(["'world'", "uppercase(it)", "greet(it)"]);
    const meta = applyMixinToObject(MetaMixin, fixture);
    meta.scope = new ExplorableObject({
      greet: (x) => `Hello, ${x}.`,
      uppercase: (x) => x.toUpperCase(),
    });
    assert.equal(await meta.get("result"), "Hello, WORLD.");
  });
});
