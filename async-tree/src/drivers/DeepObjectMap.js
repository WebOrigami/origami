import isAsyncTree from "../operations/isAsyncTree.js";
import isPlainObject from "../utilities/isPlainObject.js";
import ObjectMap from "./ObjectMap.js";

export default class DeepObjectMap extends ObjectMap {
  get(key) {
    let value = super.get(key);
    if (value instanceof Array || isPlainObject(value)) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }

  isSubtree(value) {
    return value instanceof Array || isPlainObject(value) || isAsyncTree(value);
  }
}
