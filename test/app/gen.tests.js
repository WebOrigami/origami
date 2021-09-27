import impliedKeys from "../../src/app/gen.js";
import assert from "../assert.js";

describe("gen", () => {
  it("generates implications of variable definitions", async () => {
    const fixture = impliedKeys(
      [
        // Representation of a formula `{foo}.html = ƒ({foo}.handlebars, {foo}.json)`
        // I.e., a pair of handlebars and json file implies a corresponding html file.
        {
          antecedents: [
            { prefix: "", suffix: ".handlebars" },
            { prefix: "", suffix: ".json" },
          ],
          consequent: { prefix: "", suffix: ".html" },
        },
      ],
      [
        "a.handlebars",
        "a.json",
        "b.json", // Missing corresponding .handlebars file
        "c.handlebars", // Missing corresponding .json file
        "d.handlebars",
        "d.json",
      ]
    );
    const results = fixture;
    assert.deepEqual(results, [
      // Defined keys
      "a.handlebars",
      "a.json",
      "b.json",
      "c.handlebars",
      "d.handlebars",
      "d.json",
      // Implied keys
      "a.html",
      "d.html",
    ]);
  });
});
