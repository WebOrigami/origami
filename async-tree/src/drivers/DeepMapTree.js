import { Tree } from "../internal.js";
import MapTree from "./MapTree.js";

export default class DeepMapTree extends MapTree {
  async get(key) {
    let value = await super.get(key);

    if (value instanceof Map) {
      value = Reflect.construct(this.constructor, [value]);
    }

    if (Tree.isAsyncTree(value) && !value.parent) {
      value.parent = this;
    }

    return value;
  }

  /** @returns {boolean} */
  isSubtree(value) {
    return value instanceof Map || Tree.isAsyncTree(value);
  }
}
