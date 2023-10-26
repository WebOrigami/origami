import { Tree } from "@graphorigami/core";
import process, { stdout } from "node:process";
import { transformObject } from "../common/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import setDeep from "./@tree/setDeep.js";

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} source
 * @param {Treelike} target
 */
export default async function copy(source, target) {
  assertScopeIsDefined(this);
  // const start = performance.now();
  const sourceTree = Tree.from(source);
  /** @type {any} */ let targetTree = Tree.from(target);

  if (stdout.isTTY) {
    targetTree = transformObject(ProgressTransform, targetTree);
    copyRoot = targetTree;
    countFiles = 0;
    countCopied = 0;
  }

  await setDeep(targetTree, sourceTree);

  if (stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    copyRoot = null;
    countFiles = null;
    countCopied = null;
  }

  // const end = performance.now();
  // console.log(`copy time in ms: ${end - start}`);
}

let countFiles;
let countCopied;
let copyRoot;

function ProgressTransform(Base) {
  return class Progress extends Base {
    async set(...args) {
      countFiles++;
      copyRoot.showProgress();
      const result = await super.set(...args);
      countCopied++;
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

copy.usage = `@copy <source>, <target>\tCopies the source tree to the target`;
copy.documentation = "https://graphorigami.org/language/@copy.html";
