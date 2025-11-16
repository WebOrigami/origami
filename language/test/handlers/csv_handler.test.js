import assert from "node:assert";
import { describe, test } from "node:test";
import csv_handler from "../../src/handlers/csv_handler.js";

describe(".csv handler", () => {
  test("parses CSV text into array of objects", () => {
    const csvText = `name,age,city
Alice,30,"New York, NY"
Bob,25,Los Angeles
"Carol ""CJ""",22,Chicago`;
    const result = csv_handler.unpack(csvText);
    assert.deepStrictEqual(result, [
      { name: "Alice", age: 30, city: "New York, NY" },
      { name: "Bob", age: 25, city: "Los Angeles" },
      { name: 'Carol "CJ"', age: 22, city: "Chicago" },
    ]);
  });

  test("handles CRLF line endings", () => {
    const textCRLF = `name,age,city\r\nAlice,30,"New York, NY"\r\nBob,25,Los Angeles\r\n`;
    const expected = [
      { name: "Alice", age: 30, city: "New York, NY" },
      { name: "Bob", age: 25, city: "Los Angeles" },
    ];
    const result = csv_handler.unpack(textCRLF);
    assert.deepStrictEqual(result, expected);
  });

  test("throws an error for unmatched quotes", () => {
    // Provide a CSV string with an unmatched quote.
    const badCSV = `name,age\r\nAlice,30\r\nBob,"25\r\n`;
    assert.throws(() => {
      csv_handler.unpack(badCSV);
    }, /unmatched quote/);
  });
});
