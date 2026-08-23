import * as args from "../utilities/args.js";

/**
 * Return the keys of the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function keys(maplike) {
  const map = await args.map(maplike, "Tree.keys");
  const keys = [];
  const iterator = map.keys();
  let next = await iterator.next();
  while (!next.done) {
    keys.push(next.value);
    next = await iterator.next();
  }
  return keys;
}
