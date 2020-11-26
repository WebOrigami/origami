import { Explorable } from "@explorablegraph/exfn";
import chai from "chai";
import evaluate from "../src/evaluate.js";
const { assert } = chai;

describe("evaluate", () => {
  it("can parse, link, and execute", () => {
    const source = "greet(world)";
    const scope = Explorable({
      greet(name) {
        return `Hello ${name}`;
      },
    });
    const result = evaluate(source, scope, "world");
    assert.equal(result, "Hello world");
  });
});
