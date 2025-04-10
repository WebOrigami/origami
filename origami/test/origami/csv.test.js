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
    const result = await csv.call(null, data);

    // The expected header is inferred from the first object's keys.
    // Depending on the object key iteration order, the header is assumed to be:
    const expectedHeader = "name,age,city";

    // Expected CSV output lines (with CRLF as line separator):
    const expectedLines = [
      expectedHeader,
      'Alice,30,"New York, NY"',
      "Bob,25,Los Angeles",
      '"Carol ""CJ""",22,Chicago',
    ];
    const expectedCSV = expectedLines.join("\r\n");

    assert.strictEqual(result, expectedCSV);
  });

  test("returns an empty string for empty array input", async () => {
    const result = await csv.call(null, []);
    assert.strictEqual(result, "");
  });
});
