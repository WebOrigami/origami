import { Tree } from "@weborigami/async-tree";
import * as math from "./@math.js";
import dev from "./dev.js";
import files from "./files.js";
import js from "./js.js";
import node from "./node.js";
import origami from "./origami.js";
import site from "./site.js";
import text from "./text.js";
import tree from "./tree.js";

export function command(newKey, oldKey, fn) {
  return function (...args) {
    console.warn(
      `ori: Warning: the "${oldKey}" syntax is deprecated. Use "${newKey}" instead.`
    );
    return fn instanceof Function
      ? fn.call(this, ...args)
      : Tree.traverseOrThrow(fn, ...args);
  };
}

export function commands(namespace, object) {
  const deprecatedEntries = Object.entries(object).map(([key, fn]) => [
    `@${key}`,
    command(`${namespace}:${key}`, `@${key}`, fn),
  ]);
  return Object.fromEntries(deprecatedEntries);
}

export default {
  ...commands("calc:", math),
  ...commands("dev:", dev),
  "@files": command("files:", "@files/", files),
  "@image": command("image:", "@image/", files),
  "@js": command("js:", "@js/", js),
  "@node": command("node:", "@node/", node),
  ...commands("origami:", origami),
  ...commands("site:", site),
  ...commands("text:", text),
  ...commands("tree:", tree),
  "@tree": command("tree:", "@tree/", Tree),
};
