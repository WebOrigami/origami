import assert from "node:assert";
import { describe, test } from "node:test";

import { Graph } from "@graphorigami/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import builtins from "../../src/builtins/@builtins.js";
import MapExtensionsGraph from "../../src/common/MapExtensionsGraph.js";
import Scope from "../../src/common/Scope.js";
import OrigamiFiles from "../../src/framework/OrigamiFiles.js";
import OrigamiGraph from "../../src/framework/OrigamiGraph.js";
import unpackOrigamiExpression from "../../src/loaders/ori.js";

const dirname = path.join(path.dirname(fileURLToPath(import.meta.url)));
const fixtures = new OrigamiFiles(dirname);

// Map the YAML files to test suites.
const mapped = new MapExtensionsGraph(fixtures, runYamlSuite, {
  extension: "yaml",
});

// Force a traversal of the graph, triggering registration of all the tests.
await Graph.plain(mapped);

async function runYamlSuite(yamlFile) {
  const { name, tests } = await yamlFile.unpack();
  describe(name, async () => {
    for (const suiteTest of tests) {
      const {
        fixture,
        title,
        expected,
        "actual.ori": actualExpression,
      } = suiteTest;

      const fixtureGraph = fixture ? new OrigamiGraph(fixture) : null;
      if (fixtureGraph) {
        fixtureGraph.parent = builtins;
      }
      const scope = new Scope(fixtureGraph, builtins);

      test(title, async () => {
        const value = await unpackOrigamiExpression(actualExpression);
        const result =
          typeof value === "function" ? await value.call(scope) : value;
        assert.deepEqual(result, expected);
      });
    }
  });
}
