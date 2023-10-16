import assert from "node:assert";
import { describe, test } from "node:test";

import { Tree } from "@graphorigami/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import builtins from "../../src/builtins/@builtins.js";
import MapExtensionsTree from "../../src/common/MapExtensionsTree.js";
import TextDocument from "../../src/common/TextDocument.js";
import OrigamiFiles from "../../src/framework/OrigamiFiles.js";
import OrigamiTree from "../../src/framework/OrigamiTree.js";

const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));
const fixtures = new OrigamiFiles(dirname);

// Map the YAML files to test suites.
const mapped = new MapExtensionsTree(fixtures, registerYamlSuite, {
  extension: "yaml",
});

// Force a traversal of the tree, triggering registration of all the tests.
await Tree.plain(mapped);

/**
 * Given a YAML file found in this test directory, register its contents as a
 * test suite.
 */
async function registerYamlSuite(yamlFile) {
  const { name, tests } = await yamlFile.unpack();
  describe(name, async () => {
    for (const suiteTest of tests) {
      const { title, expected } = suiteTest;

      const fixture = new OrigamiTree(suiteTest.fixture);
      if (fixture) {
        fixture.parent = builtins;
      }

      test(title, async () => {
        const expression = await fixture.get("actual.ori");
        const actual = await expression.unpack();
        const actualNormalized =
          actual instanceof TextDocument ? String(actual) : actual;
        assert.deepEqual(actualNormalized, expected);
      });
    }
  });
}
