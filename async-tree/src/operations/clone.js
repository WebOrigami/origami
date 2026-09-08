import * as args from "../utilities/args.js";
import mapReduce from "./mapReduce.js";

/**
 * Return a copy of the given maplike object
 *
 * @param {import("../../index.ts").Maplike} maplike
 */
export default async function clone(maplike) {
  const source = await args.map(maplike, "Tree.clone", { deep: true });
  const cloned = await mapReduce(
    source,
    (x) => x,
    (results) => results,
  );
  return cloned;
}
