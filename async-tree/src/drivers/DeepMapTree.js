import isAsyncTree from "../operations/isAsyncTree.js";
import MapTree from "./MapTree.js";

export default class DeepMapTree extends MapTree {
  async get(key) {
    let value = await super.get(key);

    if (value instanceof Map) {
      value = Reflect.construct(this.constructor, [value]);
    }

    if (isAsyncTree(value) && !value.parent) {
      value.parent = this;
    }

    return value;
  }

  /** @returns {boolean} */
  isSubtree(value) {
    return value instanceof Map || isAsyncTree(value);
  }
}
