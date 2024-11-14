import { Tree } from "@weborigami/async-tree";
import * as calc from "./calc/calc.js";
import * as dev from "./dev/dev.js";
import * as image from "./image/image.js";
import js from "./js.js";
import node from "./node.js";
import * as origami from "./origami/origami.js";
import files from "./protocols/files.js";
import * as site from "./site/site.js";
import * as text from "./text/text.js";
import * as tree from "./tree/tree.js";

const warningsDisplayedForKeys = new Set();

export function command(namespace, newKey, oldKey, fn) {
  const wrappedFn = function (...args) {
    const keys = newKey
      ? `"${namespace}${newKey}" or just "${newKey}"`
      : `"${namespace}"`;
    if (!warningsDisplayedForKeys.has(oldKey)) {
      console.warn(
        `ori: Warning: "${oldKey}" is deprecated. Use ${keys} instead.`
      );
      warningsDisplayedForKeys.add(oldKey);
    }
    return fn instanceof Function
      ? // @ts-ignore
        fn.call(this, ...args)
      : Tree.traverseOrThrow(fn, ...args);
  };
  if (fn.key) {
    wrappedFn.key = fn.key;
  }
  if (fn.inverseKey) {
    wrappedFn.inverseKey = fn.inverseKey;
  }
  return wrappedFn;
}

export function commands(namespace, object) {
  const deprecatedEntries = Object.entries(object).map(([key, fn]) => [
    `@${fn.key ?? key}`,
    command(namespace, fn.key ?? key, `@${fn.key ?? key}`, fn),
  ]);
  return Object.fromEntries(deprecatedEntries);
}

export default {
  ...commands("calc:", calc),
  ...commands("dev:", dev),
  "@false": command("js:", "false", "@false", js.false),
  "@fetch": command("js:", "fetch", "@fetch", js.fetch),
  "@files": command("files:", null, "@files/", files),
  "@image": command("image:", null, "@image/", image),
  "@js": command("js:", null, "@js/", js),
  "@math": command("calc:", null, "@math/", calc),
  "@mdHtml": command("text:", "mdHtml", "@mdHtml", text.mdHtml),
  "@node": command("node:", null, "@node/", node),
  ...commands("origami:", origami),
  ...commands("site:", site),
  ...commands("text:", text),
  ...commands("tree:", tree),
  "@tree": command("tree:", null, "@tree/", Tree),
  "@true": command("js:", "true", "@true", js.true),

  // Renamed command
  "@clean": command("tree:", "clear", "@clean", tree.clear),
};
