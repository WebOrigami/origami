import { Explorable } from "@explorablegraph/core";
import chai from "chai";
import evaluate from "../src/evaluate.js";
const { assert } = chai;

describe("evaluate", () => {
  it("can parse, link, and execute", async () => {
    const source = "greet(world)";
    const scope = Explorable({
      async greet(name) {
        return `Hello ${name}`;
      },
    });
    const result = await evaluate(source, scope, "world");
    assert.equal(result, "Hello world");
  });
});
