import assert from "node:assert";
import { describe, test } from "node:test";
import tsv_handler from "../../src/handlers/tsv_handler.js";

describe(".tsv handler", () => {
  test("parses TSV text into array of objects", () => {
    const TSVText = `name	age	city
Alice\t30\tNew York, NY
Bob\t25\tLos Angeles
Carol\t22\tChicago`;
    const result = tsv_handler.unpack(TSVText);
    assert.deepStrictEqual(result, [
      { name: "Alice", age: 30, city: "New York, NY" },
      { name: "Bob", age: 25, city: "Los Angeles" },
      { name: "Carol", age: 22, city: "Chicago" },
    ]);
  });

  test("handles CRLF line endings", () => {
    const textCRLF = `name\tage\tcity\r\nAlice\t30\tNew York, NY\r\nBob\t25\tLos Angeles\r\n`;
    const expected = [
      { name: "Alice", age: 30, city: "New York, NY" },
      { name: "Bob", age: 25, city: "Los Angeles" },
    ];
    const result = tsv_handler.unpack(textCRLF);
    assert.deepStrictEqual(result, expected);
  });
});
