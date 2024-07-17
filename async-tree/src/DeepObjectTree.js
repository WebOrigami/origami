import { ObjectTree, Tree } from "./internal.js";
import { isPlainObject } from "./utilities.js";

export default class DeepObjectTree extends ObjectTree {
  async get(key) {
    let value = await super.get(key);

    const isPlain =
      value instanceof Array ||
      (isPlainObject(value) && !Tree.isAsyncTree(value));
    if (isPlain) {
      value = Reflect.construct(this.constructor, [value]);
    }

    return value;
  }

  async isKeyForSubtree(key) {
    const value = await this.object[key];
    return isPlainObject(value) || Tree.isAsyncTree(value);
  }
}
