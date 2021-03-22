import { asyncGet, asyncKeys } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";

export default class Transform extends AsyncExplorable {
  constructor(inner, options = {}) {
    super();
    this.inner = new AsyncExplorable(inner);
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

  async *[asyncKeys]() {
    for await (const innerKey of this.inner[asyncKeys]()) {
      const outerKey = await this.outerKeyForInnerKey(innerKey);
      if (outerKey !== undefined) {
        yield outerKey;
      }
    }
  }

  // TODO: [...keys]
  async [asyncGet](outerKey) {
    const innerKey = await this.innerKeyForOuterKey(outerKey);
    const inner = this.inner;
    const value = innerKey ? await inner[asyncGet](innerKey) : undefined;
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
