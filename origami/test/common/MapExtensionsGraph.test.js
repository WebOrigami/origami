import { Graph } from "@graphorigami/core";
import assert from "node:assert";
import { describe, test } from "node:test";
import MapExtensionsGraph from "../../src/common/MapExtensionsGraph.js";

describe("MapExtensionsGraph", () => {
  test("applies a mapping function to keys that end in a given extension", async () => {
    const fixture = new MapExtensionsGraph(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
        "file3.foo": "won't be mapped",
      },
      (s) => s.toUpperCase(),
      {
        deep: true,
        extension: "txt",
      }
    );
    assert.deepEqual(await Graph.plain(fixture), {
      "file1.txt": "WILL BE MAPPED",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
  });

  test("can change a key's extension", async () => {
    const fixture = new MapExtensionsGraph(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
        "file3.foo": "won't be mapped",
      },
      (s) => s.toUpperCase(),
      {
        deep: true,
        extension: "txt→upper",
      }
    );
    assert.deepEqual(await Graph.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      file2: "won't be mapped",
      "file3.foo": "won't be mapped",
    });
  });

  test("can exclude non-graph keys that don't match extension", async () => {
    const fixture = new MapExtensionsGraph(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
        "file3.foo": "won't be mapped",
        more: {
          "file4.txt": "will be mapped",
          "file5.bar": "won't be mapped",
        },
      },
      (s) => s.toUpperCase(),
      {
        deep: true,
        extension: "txt->upper",
        extensionMatchesOnly: true,
      }
    );
    assert.deepEqual(await Graph.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
      more: {
        "file4.upper": "WILL BE MAPPED",
      },
    });
  });

  test("extension can include a period", async () => {
    const fixture = new MapExtensionsGraph(
      {
        "file1.txt": "will be mapped",
        file2: "won't be mapped",
      },
      (s) => s.toUpperCase(),
      {
        extension: ".txt → .upper",
        extensionMatchesOnly: true,
      }
    );
    assert.deepEqual(await Graph.plain(fixture), {
      "file1.upper": "WILL BE MAPPED",
    });
  });

  test("applies a mapping function to convert extensions in the middle of a path", async () => {
    const fixture = new MapExtensionsGraph(
      {
        "file1.txt": "Hello, a.",
        file2: "won't be mapped",
      },
      (value) => ({
        data: value,
      }),
      {
        deep: true,
        extension: "txt→json",
      }
    );
    assert.deepEqual(await Graph.plain(fixture), {
      "file1.json": {
        data: "Hello, a.",
      },
      file2: "won't be mapped",
    });
    assert.equal(
      await Graph.traverse(fixture, "file1.json", "data"),
      "Hello, a."
    );
  });
});
