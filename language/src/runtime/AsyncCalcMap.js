import { isPlainObject, SyncMap } from "@weborigami/async-tree";
import AsyncCacheTransform from "./AsyncCacheTransform.js";

export default class AsyncCalcMap extends AsyncCacheTransform(
  InvokeFunctionsTransform(SyncMap),
) {}

function InvokeFunctionsTransform(Base) {
  return class extends Base {
    constructor(iterable) {
      if (isPlainObject(iterable)) {
        iterable = Object.entries(iterable);
      }
      super(iterable);
    }

    async get(key) {
      let value = await super.get(key);
      if (typeof value === "function") {
        value = await value();
      }
      return value;
    }
  };
}
