import ObjectTree from "./ObjectTree.js";
import * as Tree from "./Tree.js";
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

    if (Tree.isAsyncTree(value) && !value.parent) {
      value.parent = this;
    }

    return value;
  }
}
