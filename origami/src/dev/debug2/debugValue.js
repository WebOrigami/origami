import { Tree, isUnpackable } from "@weborigami/async-tree";
import debugTransform from "./debugTransform.js";

/**
 * If the value is a Map, apply the debug transform to it. If the value is
 * unpackable, wrap its unpack method to apply the debug transform to the
 * result. Otherwise, return the value as is.
 *
 * @param {any} value
 */
export default function debugValue(value) {
  if (Tree.isMap(value)) {
    return debugTransform(value);
  }

  if (isUnpackable(value)) {
    const original = value.unpack.bind(value);
    value.unpack = async () => {
      const content = await original();
      if (!Tree.isTraversable(content) || typeof content === "function") {
        return content;
      }
      /** @type {any} */
      let tree = Tree.from(content);
      return debugTransform(tree);
    };
  }

  return value;
}
