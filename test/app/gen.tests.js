import impliedKeys from "../../src/app/gen.js";
import assert from "../assert.js";

describe("gen", () => {
  it("generates implications", async () => {
    const fixture = impliedKeys(
      [
        { consequent: "a", antecedents: ["b"] },
        { consequent: "b", antecedents: ["c", "d"] }, // "d" is redundant
        { consequent: "c", antecedents: ["d"] },
      ],
      ["d"]
    );
    assert.deepEqual(fixture, ["d", "c", "b", "a"]);
  });

  it("generates implications of real keys", async () => {
    const fixture = impliedKeys(
      [
        {
          antecedents: ["index.json"],
          consequent: "index.html",
        },
      ],
      ["index.json"]
    );
    assert.deepEqual(fixture, ["index.json", "index.html"]);
  });

  it.only("generates implications of variable definitions", async () => {
    const fixture = impliedKeys(
      [
        {
          antecedents: [{ prefix: "", suffix: ".json" }],
          consequent: { prefix: "", suffix: ".html" },
        },
      ],
      ["a.json", "b.json"]
    );
    const results = fixture;
    assert.deepEqual(results, ["a.json", "b.json", "a.html", "b.html"]);
  });
});
