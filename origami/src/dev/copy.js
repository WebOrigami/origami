import { getTreeArgument, Tree } from "@weborigami/async-tree";
import { formatError } from "@weborigami/language";
import process, { stdout } from "node:process";
import { transformObject } from "../common/utilities.js";

/**
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 *
 * @param {Maplike} source
 * @param {Maplike} target
 */
export default async function copy(source, target) {
  const sourceTree = await getTreeArgument(source, "copy", { position: 0 });
  let targetTree = await getTreeArgument(target, "copy", { position: 1 });

  if (stdout.isTTY) {
    targetTree =
      targetTree instanceof Map
        ? transformObject(SyncProgressTransform, targetTree)
        : transformObject(AsyncProgressTransform, targetTree);
    copyRoot = targetTree;
    countFiles = 0;
    countCopied = 0;
  }

  await Tree.assign(targetTree, sourceTree);

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

function AsyncProgressTransform(Base) {
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

function SyncProgressTransform(Base) {
  return class Progress extends Base {
    set(...args) {
      countFiles++;
      copyRoot.showProgress();
      let result;
      try {
        result = super.set(...args);
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
