/**
 * Integration tests of several forms of caching using the system cache
 */

import { SyncMap, Tree } from "@weborigami/async-tree";
import assert from "node:assert";
import { describe, test } from "node:test";
import * as handlers from "../../src/handlers/handlers.js";
import HandleExtensionsTransform from "../../src/runtime/HandleExtensionsTransform.js";
import SyncCacheTransform from "../../src/runtime/SyncCacheTransform.js";

describe("systemCache", () => {
  test("property based on external scope recalculates when scope changes", async () => {
    // Virtual src folder
    const src = new OrigamiSyncMap([
      [
        "site.ori",
        `
        {
          value = data.json/
        }
      `,
      ],
    ]);

    // Virtual project root folder
    const project = new OrigamiSyncMap([
      ["data.json", "1"],
      ["src", src],
    ]);

    // Make src a child of the project root
    src.parent = project;

    // Cache paths are optional but make cache keys more meaningful
    src.cachePath = "project/src";
    project.cachePath = "project";

    // Add handlers so we can unpack values
    project.globals = handlers;

    const value1 = await Tree.traverseOrThrow(
      project,
      "src",
      "site.ori",
      "value",
    );
    assert.equal(value1, 1);

    // Add new data.json to src folder, overriding the one in project root
    src.set("data.json", "2");

    const value2 = await Tree.traverseOrThrow(
      project,
      "src",
      "site.ori",
      "value",
    );
    assert.equal(value2, 2);
  });
});

// Like OrigamiFileMap, but in memory
class OrigamiSyncMap extends SyncCacheTransform(
  HandleExtensionsTransform(SyncMap),
) {}
