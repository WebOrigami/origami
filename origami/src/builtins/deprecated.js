import { Tree } from "@weborigami/async-tree";
import calc from "../calc/calc.js";
import * as dev from "../dev/dev.js";
import * as origami from "../origami/origami.js";
import files from "./files.js";
import js from "./js.js";
import node from "./node.js";
import * as site from "./site.js";
import * as text from "./text.js";
import tree from "./tree.js";

export function command(namespace, newKey, oldKey, fn) {
  return function (...args) {
    const keys = newKey
      ? `"${namespace}${newKey}" or ":${newKey}"`
      : `"${namespace}"`;
    console.warn(
      `ori: Warning: "${oldKey}" is deprecated. Use ${keys} instead.`
    );
    return fn instanceof Function
      ? // @ts-ignore
        fn.call(this, ...args)
      : Tree.traverseOrThrow(fn, ...args);
  };
}

export function commands(namespace, object) {
  const deprecatedEntries = Object.entries(object).map(([key, fn]) => [
    `@${key}`,
    command(namespace, key, `@${key}`, fn),
  ]);
  return Object.fromEntries(deprecatedEntries);
}

export default {
  ...commands("calc:", {
    add: calc.add,
    divide: calc.divide,
    multiple: calc.multiply,
    subtract: calc.subtract,
  }),
  ...commands("dev:", dev),
  "@files": command("files:", null, "@files/", files),
  "@image": command("image:", null, "@image/", files),
  "@js": command("js:", null, "@js/", js),
  "@node": command("node:", null, "@node/", node),
  ...commands("origami:", origami),
  ...commands("site:", site),
  ...commands("text:", text),
  ...commands("tree:", tree),
  "@tree": command("tree:", null, "@tree/", Tree),
};
