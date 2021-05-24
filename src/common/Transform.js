import ExplorableObject from "../core/ExplorableObject.js";

export default class Transform {
  constructor(inner, options = {}) {
    this.inner = ExplorableObject.explore(inner);
    if (options.outerKeyForInnerKey) {
      this.outerKeyForInnerKey = options.outerKeyForInnerKey;
    }
    if (options.innerKeyForOuterKey) {
      this.innerKeyForOuterKey = options.innerKeyForOuterKey;
    }
    if (options.transform) {
      this.transform = options.transform;
    }
  }

  async *[Symbol.asyncIterator]() {
    for await (const innerKey of this.inner) {
      const outerKey = await this.outerKeyForInnerKey(innerKey);
      if (outerKey !== undefined) {
        yield outerKey;
      }
    }
  }

  async get(outerKey, ...rest) {
    const innerKey = await this.innerKeyForOuterKey(outerKey);
    const inner = this.inner;
    const value = innerKey ? await inner.get(innerKey, ...rest) : undefined;
    return value ? await this.transform(value, outerKey, innerKey) : undefined;
  }

  // The default implementation returns the key unmodified.
  async innerKeyForOuterKey(key) {
    return key;
  }

  // The default implementation returns the key unmodified.
  async outerKeyForInnerKey(key) {
    return key;
  }

  // The default implementation returns the object unmodified.
  async transform(obj, outerKey, innerKey) {
    return obj;
  }
}
