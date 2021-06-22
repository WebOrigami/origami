import ExplorableObject from "../../src/core/ExplorableObject.js";
import evaluate from "../../src/eg/evaluate.js";
import assert from "../assert.js";

describe("evaluate", () => {
  it("can parse, link, and execute", async () => {
    const source = `greet("world")`;
    const scope = new ExplorableObject({
      async greet(name) {
        return `Hello ${name}`;
      },
    });
    const result = await evaluate(source, scope);
    assert.equal(result, "Hello world");
  });
});
