import { asyncOps, Transform } from "@explorablegraph/core";
import path from "path";
import Files from "./Files.js";

export default class VirtualFiles extends Transform {
  constructor(dirname) {
    super(new Files(dirname));
    this.dirname = dirname;
  }

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
      // This is inefficient: the Transform class has already loaded the
      // module's contents as a buffer, but we can't import that, so we throw
      // that away and load the module ourselves.
      const filePath = path.join(this.dirname, innerKey);
      const obj = await import(filePath);
      const fn = obj.default;
      return typeof fn === "function" ? fn(this) : fn;
    }
    return obj;
  }
}
