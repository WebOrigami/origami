import { isPlainObject, SyncMap, Tree } from "@weborigami/async-tree";
import cacheWithTracking from "./cacheWithTracking.js";

export default async function calcs(iterable) {
  if (isPlainObject(iterable)) {
    iterable = Object.entries(iterable);
  }
  const map = new SyncMap(iterable);
  return cacheWithTracking(await Tree.invokeFunctions(map));
}
