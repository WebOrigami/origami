import { asyncGet, asyncKeys } from "@explorablegraph/core";
import path from "path";
import Files from "./Files.js";

export default class VirtualFiles extends TransformMixin(Files) {
  async innerKeyForOuterKey(outerKey) {
    const keys = [];
    for await (const key of this.innerKeys()) {
      keys.push(key);
    }
    const virtualKey = `${outerKey}←.js`;
    // Prefer outer key if found in inner graph, otherwise use virtual key if it
    // exists.
    return keys.includes(outerKey)
      ? outerKey
      : keys.includes(virtualKey)
      ? virtualKey
      : undefined;
  }

  async outerKeyForInnerKey(innerKey) {
    return innerKey.endsWith("←.js")
      ? path.basename(innerKey, "←.js")
      : innerKey;
  }

  async transform(obj, outerKey, innerKey) {
    if (innerKey.endsWith("←.js")) {
      // This is inefficient: the transform has already loaded the module's
      // contents as a buffer, but we can't import that, so we throw that away
      // and load the module ourselves.
      const filePath = path.join(this.dirname, innerKey);
      const obj = await import(filePath);
      const fn = obj.default;
      return typeof fn === "function" ? fn(this) : fn;
    }
    return obj;
  }
}

function TransformMixin(Base) {
  return class Transform extends Base {
    async [asyncGet](outerKey, ...rest) {
      const innerKey = await this.innerKeyForOuterKey(outerKey);
      const value = innerKey
        ? await super[asyncGet](innerKey, ...rest)
        : undefined;
      return value
        ? await this.transform(value, outerKey, innerKey)
        : undefined;
    }

    async *[asyncKeys]() {
      for await (const innerKey of super[asyncKeys]()) {
        const outerKey = await this.outerKeyForInnerKey(innerKey);
        if (outerKey !== undefined) {
          yield outerKey;
        }
      }
    }

    // The default implementation returns the key unmodified.
    async innerKeyForOuterKey(key) {
      return key;
    }

    async *innerKeys() {
      yield* super[asyncKeys]();
    }

    // The default implementation returns the key unmodified.
    async outerKeyForInnerKey(key) {
      return key;
    }

    // The default implementation returns the object unmodified.
    async transform(obj, outerKey, innerKey) {
      return obj;
    }
  };
}
