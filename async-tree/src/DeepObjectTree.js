import { ObjectTree, Tree } from "./internal.js";
import { isPlainObject } from "./utilities.js";

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
    return (
      value instanceof Array || isPlainObject(value) || Tree.isAsyncTree(value)
    );
  }
}
