import { asyncGet, asyncKeys, get } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";

export default class Transform extends AsyncExplorable {
  constructor(inner, options = {}) {
    super();
    this.inner = AsyncExplorable(inner);
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
    for await (const innerKey of this.inner) {
      const outerKey = this.outerKeyForInnerKey(innerKey);
      if (outerKey !== undefined) {
        yield outerKey;
      }
    }
  }

  // TODO: [...keys]
  async [asyncGet](outerKey) {
    const innerKey = this.innerKeyForOuterKey(outerKey);
    const inner = this.inner;
    const getFn = inner[get] ? get : asyncGet;
    const value = innerKey ? await inner[getFn](innerKey) : undefined;
    return value ? await this.transform(value) : undefined;
  }

  // The default implementation returns the key unmodified.
  innerKeyForOuterKey(key) {
    return key;
  }

  // The default implementation returns the key unmodified.
  outerKeyForInnerKey(key) {
    return key;
  }

  // The default implementation returns the object unmodified.
  async transform(obj) {
    return obj;
  }
}
