import assert from "node:assert";
import { describe, test } from "node:test";

import { Graph } from "@graphorigami/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import builtins from "../../src/builtins/@builtins.js";
import MapExtensionsGraph from "../../src/common/MapExtensionsGraph.js";
import OrigamiFiles from "../../src/framework/OrigamiFiles.js";
import OrigamiGraph from "../../src/framework/OrigamiGraph.js";

const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));
const fixtures = new OrigamiFiles(dirname);

// Map the YAML files to test suites.
const mapped = new MapExtensionsGraph(fixtures, registerYamlSuite, {
  extension: "yaml",
});

// Force a traversal of the graph, triggering registration of all the tests.
await Graph.plain(mapped);

/**
 * Given a YAML file found in this test directory, register its contents as a
 * test suite.
 */
async function registerYamlSuite(yamlFile) {
  const { name, tests } = await yamlFile.unpack();
  describe(name, async () => {
    for (const suiteTest of tests) {
      const { title, expected } = suiteTest;

      const fixture = new OrigamiGraph(suiteTest.fixture);
      if (fixture) {
        fixture.parent = builtins;
      }

      test(title, async () => {
        const expression = await fixture.get("actual.ori");
        const actual = await expression.unpack();
        assert.deepEqual(actual, expected);
      });
    }
  });
}
