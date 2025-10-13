import assert from "node:assert";
import { describe, test } from "node:test";
import csv from "../../src/origami/csv.js";

describe("csv", () => {
  test("formats array of objects into CSV text with header", async () => {
    const data = [
      { name: "Alice", age: 30, city: "New York, NY" },
      { name: "Bob", age: 25, city: "Los Angeles" },
      { name: 'Carol "CJ"', age: 22, city: "Chicago" },
    ];
    const result = await csv(data);

    const expected = `name,age,city
Alice,30,"New York, NY"
Bob,25,Los Angeles
"Carol ""CJ""",22,Chicago
`;
    const normalized = expected.replace(/\n/g, "\r\n");

    assert.strictEqual(result, normalized);
  });

  test("returns an empty string for empty array input", async () => {
    const result = await csv([]);
    assert.strictEqual(result, "");
  });
});
