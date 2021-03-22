import { asyncOps, Transform } from "@explorablegraph/core";
import path from "path";

export default class ArrowModules extends Transform {
  async innerKeyForOuterKey(outerKey) {
    const keys = await asyncOps.keys(this.inner);
    return keys.includes(outerKey) ? outerKey : `${outerKey}←.js`;
  }

  async outerKeyForInnerKey(innerKey) {
    return innerKey.endsWith("←.js")
      ? path.basename(innerKey, "←.js")
      : innerKey;
  }

  async transform(obj, outerKey, innerKey) {
    if (innerKey.endsWith("←.js")) {
      const fn = obj.default;
      return typeof fn === "function" ? fn(this) : fn;
    }
    return obj;
  }
}
