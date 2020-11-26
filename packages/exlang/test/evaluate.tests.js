import { Explorable } from "@explorablegraph/exfn";
import chai from "chai";
import { default as execute } from "../src/execute.js";
import link from "../src/link.js";
import parse from "../src/parse.js";
const { assert } = chai;

describe("evaluate", () => {
  it("can parse, link, and execute", () => {
    const source = "greet(world)";
    const parsed = parse(source);

    const scope = Explorable({
      greet(name) {
        return `Hello ${name}`;
      },
    });
    const linked = link(parsed, scope);
    const result = execute(linked, "world");
    assert.equal(result, "Hello world");
  });
});
