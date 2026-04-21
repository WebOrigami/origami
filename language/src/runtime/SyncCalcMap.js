import { isPlainObject, SyncMap } from "@weborigami/async-tree";
import SyncCacheTransform from "./SyncCacheTransform.js";

export default class SyncCalcMap extends SyncCacheTransform(
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

    get(key) {
      let value = super.get(key);
      if (typeof value === "function") {
        value = value();
      }
      return value;
    }
  };
}
