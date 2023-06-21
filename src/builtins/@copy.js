import process, { stdout } from "node:process";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import setDeep from "./@graph/setDeep.js";

/**
 * @this {Explorable|null}
 * @param {GraphVariant} source
 * @param {GraphVariant} target
 */
export default async function copy(source, target) {
  assertScopeIsDefined(this);
  // const start = performance.now();
  const sourceGraph = ExplorableGraph.from(source);
  /** @type {any} */ let targetGraph = ExplorableGraph.from(target);

  if (stdout.isTTY) {
    targetGraph = transformObject(ProgressTransform, targetGraph);
    copyRoot = targetGraph;
    countFiles = 0;
    countCopied = 0;
  }

  await setDeep(targetGraph, sourceGraph);

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

copy.usage = `@copy <source>, <target>\tCopies the source graph to the target`;
copy.documentation = "https://graphorigami.org/language/@copy.html";
