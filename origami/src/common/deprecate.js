import { Tree } from "@weborigami/async-tree";

export function command(newKey, oldKey, fn) {
  return function (...args) {
    console.warn(
      `ori: the command "${oldKey}" is deprecated. Use "${newKey}" instead.`
    );
    return fn instanceof Function
      ? fn.call(this, ...args)
      : Tree.traverseOrThrow(fn, ...args);
  };
}

export function commands(namespace, commands) {
  const deprecatedEntries = Object.entries(commands).map(([key, fn]) => [
    `@${key}`,
    command(`${namespace}${key}`, `@${key}`, fn),
  ]);
  const deprecated = Object.fromEntries(deprecatedEntries);
  return { ...deprecated, ...commands };
}
