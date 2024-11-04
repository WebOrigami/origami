import { Tree } from "@weborigami/async-tree";
import addColons from "./addColons.js";

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

export function commands(object) {
  const deprecatedEntries = Object.entries(object).map(([key, fn]) => [
    `@${key}`,
    command(`${key}:`, `@${key}`, fn),
  ]);
  const deprecated = Object.fromEntries(deprecatedEntries);
  return { ...deprecated, ...addColons(object) };
}
