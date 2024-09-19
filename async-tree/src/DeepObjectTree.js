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

  async isKeyForSubtree(key) {
    let value = await this.object[key];
    if (value === undefined) {
      // Try adding or removing trailing slash
      key = key.endsWith("/") ? key.slice(0, -1) : key + "/";
      value = await this.object[key];
    }
    return (
      value instanceof Array || isPlainObject(value) || Tree.isAsyncTree(value)
    );
  }
}
