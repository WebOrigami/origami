import { Tree } from "@weborigami/async-tree";
import { formatError } from "@weborigami/language";
import process, { stdout } from "node:process";
import helpRegistry from "../common/helpRegistry.js";
import { transformObject } from "../common/utilities.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import setDeep from "./setDeep.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} source
 * @param {Treelike} target
 */
export default async function copy(source, target) {
  assertTreeIsDefined(this, "tree:copy");
  const sourceTree = Tree.from(source, { parent: this });
  /** @type {any} */ let targetTree = Tree.from(target, { parent: this });

  if (stdout.isTTY) {
    targetTree = transformObject(ProgressTransform, targetTree);
    copyRoot = targetTree;
    countFiles = 0;
    countCopied = 0;
  }

  await setDeep.call(this, targetTree, sourceTree);

  if (stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    copyRoot = null;
    countFiles = null;
    countCopied = null;
  }
}

helpRegistry.set(
  "tree:copy",
  "(source, target) - Copy the source tree to the target"
);

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
