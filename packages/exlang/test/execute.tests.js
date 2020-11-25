import chai from "chai";
import link from "../src/link.js";
const { assert } = chai;

describe("execute", () => {
  it.skip("can execute a linked function", () => {
    const parsed = Explorable({
      greet: "world",
    });
    const scope = Explorable({
      greet(name) {
        return `Hello ${name}`;
      },
    });
    const linked = link(parsed, scope);
    const result = execute(linked);
    assert.equal(result, "Hello world");
  });
});
