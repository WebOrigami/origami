// Validate that the tests produce the expected results in JavaScript itself.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as YAMLModule from "yaml";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

export default async function generateTests(inputDirectory, outputDirectory) {
  const filenames = await fs.readdir(inputDirectory);
  const yamlFilenames = filenames.filter((filename) =>
    filename.endsWith(".yaml")
  );
  for (const yamlFilename of yamlFilenames) {
    const basename = path.basename(yamlFilename, ".yaml");
    const casesPath = path.join(inputDirectory, yamlFilename);
    const text = String(await fs.readFile(casesPath));
    const cases = YAML.parse(text);
    const transformed = cases.map(transformCase);
    const result = tests(basename, transformed);
    const outputName = yamlFilename.replace(/\.yaml$/, ".test.js");
    const outputPath = path.join(generatedDirectory, outputName);
    await fs.writeFile(outputPath, result);
  }
}

function javaScriptTest({ assertType, source, expectedJs, description }) {
  return `  assert.${assertType}(${source}, ${expectedJs}, "${description}");`;
}

function origamiTest({ assertType, source, expectedJs, description }) {
  return `  assert.${assertType}(await oriEval("${source}"), ${expectedJs}, "${description}");`;
}

function tests(suiteName, cases) {
  return `// Generated tests -- do not edit directly
// @ts-nocheck

import assert from "node:assert";
import { describe } from "node:test";
import oriEval from "../generator/oriEval.js";

describe("${suiteName} - JavaScript", () => {
${cases.map(javaScriptTest).join("\n")}
});

describe("${suiteName} - Origami", async() => {
${cases.map(origamiTest).join("\n")}
});`;
}
// Transform parsed YAML values into values suitable for testing
function transformCase({ description, expected, source }) {
  if (expected === "__undefined__") {
    expected = undefined;
  } else if (expected === "__NaN__") {
    expected = NaN;
  }
  const assertType = typeof expected === "object" ? "deepEqual" : "strictEqual";
  const expectedJs =
    typeof expected === "string"
      ? `"${expected}"`
      : typeof expected === "object"
      ? JSON.stringify(expected)
      : expected;
  return { assertType, description, expected, expectedJs, source };
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const casesDirectory = path.join(dirname, "../cases");
const generatedDirectory = path.join(dirname, "../generated");
await generateTests(casesDirectory, generatedDirectory);
