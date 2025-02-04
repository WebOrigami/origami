import { OrigamiFiles } from "@weborigami/language";
import path from "node:path";
import { fileURLToPath } from "node:url";
import getTreeArgument from "../common/getTreeArgument.js";
import { builtinsTree } from "../internal.js";

let tracePagePromise;

/**
 * Add tracing features to the indicated tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function trace(treelike) {
  // The debug command leaves the tree's existing scope intact; it does not
  // apply its own scope to the tree.
  let tree = await getTreeArgument(this, arguments, treelike, "dev:trace");

  return {
    async get(key) {
      if (key === ".trace") {
        // tracePagePromise ??= loadTracePage();
        // return tracePagePromise;
        return loadTracePage();
      }

      return tree.get(key);
    },

    async keys() {
      return tree.keys;
    },
  };
}

async function loadTracePage() {
  const folderPath = path.resolve(fileURLToPath(import.meta.url), "..");
  const folder = new OrigamiFiles(folderPath);
  folder.parent = builtinsTree;
  // return folder.get("trace.html");
  const pageFile = await folder.get("trace.ori.html");
  const page = await pageFile.unpack();
  return page;
}
