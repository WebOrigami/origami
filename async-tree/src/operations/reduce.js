import * as args from "../utilities/args.js";
import mapReduce from "./mapReduce.js";

/**
 * Reduce a tree by recursively applying a reducer function to its nodes.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").ReduceFn} ReduceFn
 *
 * @param {Maplike} maplike
 * @param {ReduceFn} reduceFn
 */
export default async function reduce(maplike, reduceFn) {
  const map = await args.map(maplike, "Tree.reduce");
  return mapReduce(map, null, reduceFn);
}
