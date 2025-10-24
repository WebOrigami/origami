import { getTreeArgument, Tree } from "@weborigami/async-tree";
import { formatError } from "@weborigami/language";
import process, { stdout } from "node:process";
import { transformObject } from "../common/utilities.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @param {Treelike} source
 * @param {Treelike} target
 */
export default async function copy(source, target) {
  const sourceTree = await getTreeArgument(source, "copy", { position: 0 });
  let targetTree = await getTreeArgument(target, "copy", { position: 1 });

  if (stdout.isTTY) {
    targetTree = transformObject(ProgressTransform, targetTree);
    copyRoot = targetTree;
    countFiles = 0;
    countCopied = 0;
  }

  // If target is sync, make source sync too.
  const resolved =
    targetTree instanceof Map ? await Tree.sync(sourceTree) : sourceTree;
  await Tree.assign(targetTree, resolved);

  if (stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    copyRoot = null;
    countFiles = null;
    countCopied = null;
  }
}

let countFiles;
let countCopied;
let copyRoot;

function ProgressTransform(Base) {
  return class Progress extends Base {
    async set(...args) {
      countFiles++;
      copyRoot.showProgress();
      let result;
      try {
        result = await super.set(...args);
        countCopied++;
      } catch (/** @type {any} */ error) {
        console.error(formatError(error));
      }
      copyRoot.showProgress();
      return result;
    }

    showProgress() {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`Copied ${countCopied} of ${countFiles}`);
    }
  };
}
