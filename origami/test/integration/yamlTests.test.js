import assert from "node:assert";
import { describe, test } from "node:test";

import {
  Tree,
  keyFnsForExtensions,
  mapTransform,
} from "@graphorigami/async-tree";
import { OrigamiFiles, OrigamiTree, Scope } from "@graphorigami/language";
import path from "node:path";
import { fileURLToPath } from "node:url";
import builtins from "../../src/builtins/@builtins.js";
import TextDocument from "../../src/common/TextDocument.js";

const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));
const fixtures = Scope.treeWithScope(new OrigamiFiles(dirname), builtins);

// Map the YAML files to test suites.
const mapped = mapTransform({
  deep: true,
  description: "yamlTests",
  valueFn: registerYamlSuite,
  ...keyFnsForExtensions({ innerExtension: "yaml" }),
})(fixtures);

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

      const fixture = Scope.treeWithScope(
        new OrigamiTree(suiteTest.fixture),
        builtins
      );

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
