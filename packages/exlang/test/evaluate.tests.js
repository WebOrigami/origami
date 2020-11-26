import { Explorable } from "@explorablegraph/exfn";
import chai from "chai";
import execute from "../src/execute.js";
import link from "../src/link.js";
import parse from "../src/parse.js";
const { assert } = chai;

describe.skip("evaluate", () => {
  it("can parse, link, and execute", () => {
    const source = "greet(world)";
    const parsed = parse(source);

    const scope = Explorable({
      greet(name) {
        // return `Hello ${name}`;
        return `Hello`;
      },
      String,
    });
    const exfn = link(parsed, scope);
    // const exfn = new Executable(linked);
    const result = execute(exfn, "world");
    // assert.equal(result, "Hello world");
    assert.equal(result, "Hello");
  });
});
