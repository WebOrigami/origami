import assertBuiltin from "../../src/builtins/assert.js";
import assert from "../assert.js";

describe("assert", () => {
  it("returns undefined if actual value equals expected value", async () => {
    const result = await assertBuiltin({
      description: "Should pass",
      expected: "foo",
      "actual ='foo'": "",
    });
    assert.strictEqual(result, undefined);
  });

  it("returns record if actual value doesn't equal expected value", async () => {
    const result = await assertBuiltin({
      description: "Shouldn't pass",
      expected: "foo",
      "actual ='bar'": "",
    });
    assert.deepEqual(result, {
      description: "Shouldn't pass",
      expected: "foo",
      actual: "bar",
    });
  });

  it("gives fixture graph a default scope of builtins before evaluating", async () => {
    const result = await assertBuiltin({
      description: "keys builtin returns keys",
      expected: ["a", "b", "c"],
      "actual = keys(fixture)": "",
      fixture: {
        a: 1,
        b: 2,
        c: 3,
      },
    });
    assert.strictEqual(result, undefined);
  });
});
