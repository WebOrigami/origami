import assert from "node:assert";
import { describe, test } from "node:test";
import tsv from "../../src/origami/tsv.js";

describe("tsv", () => {
  test("formats array of objects into TSV text with header", async () => {
    const data = [
      { name: "Alice", age: 30, city: "New York, NY" },
      { name: "Bob", age: 25, city: "Los Angeles" },
      { name: "Carol", age: 22, city: "Chicago" },
    ];
    const actual = await tsv(data);

    const expected = `name\tage\tcity
Alice\t30\tNew York, NY
Bob\t25\tLos Angeles
Carol\t22\tChicago
`;
    const normalized = actual.replace(/\r\n/g, "\n");

    assert.strictEqual(normalized, expected);
  });

  test("returns an empty string for empty array input", async () => {
    const result = await tsv([]);
    assert.strictEqual(result, "");
  });
});
