// Validate that the tests produce the expected results in JavaScript itself.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as YAMLModule from "yaml";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

const dirname = path.dirname(fileURLToPath(import.meta.url));
const testsDirectory = path.join(dirname, "tests");

export default async function generateJsTests() {
  const testPath = path.join(testsDirectory, "logicalAndExpression.yaml");
  const text = String(await fs.readFile(testPath));
  const cases = YAML.parse(text);
  const suite = `import assert from "node:assert";
import { describe, test } from "node:test";

describe("logicalAndExpression", () => {
${cases.map(writeTest).join("\n")}
});`;
  return suite;
}

function writeTest({ source, expected, description }) {
  if (expected === "__undefined__") {
    expected = undefined;
  } else if (expected === "__NaN__") {
    expected = NaN;
  }
  let assertType = typeof expected === "object" ? "deepEqual" : "strictEqual";
  const code =
    typeof expected === "string"
      ? `"${expected}"`
      : typeof expected === "object"
      ? JSON.stringify(expected)
      : expected;
  return `  assert.${assertType}(${source}, ${code}, "${description}");`;
}
