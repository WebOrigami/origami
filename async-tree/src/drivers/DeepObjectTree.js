import isAsyncTree from "../operations/isAsyncTree.js";
import isPlainObject from "../utilities/isPlainObject.js";
import ObjectTree from "./ObjectTree.js";

export default class DeepObjectTree extends ObjectTree {
  async get(key) {
    let value = await super.get(key);
    if (value instanceof Array || isPlainObject(value)) {
      value = Reflect.construct(this.constructor, [value]);
    }
    return value;
  }

  /** @returns {boolean} */
  isSubtree(value) {
    return value instanceof Array || isPlainObject(value) || isAsyncTree(value);
  }
}
