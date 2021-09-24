import gen from "../../src/app/gen.js";
import assert from "../assert.js";

describe("gen", () => {
  it("generates consequents", async () => {
    const fixture = gen([
      { consequent: "a", antecedents: ["b"] },
      { consequent: "b", antecedents: ["c", "d"] }, // "d" is redundant
      { consequent: "c", antecedents: ["d"] },
      { consequent: "d", antecedents: [] }, // Doesn't depend on anything else
    ]);
    const results = [...fixture];
    assert.deepEqual(results, ["d", "c", "b", "a"]);
  });
});
