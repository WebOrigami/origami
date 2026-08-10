import { Tree, box, isUnpackable } from "@weborigami/async-tree";
import { toYaml } from "../../common/serialize.js";
import debugTransform from "./debugTransform.js";
import isSimpleObject from "./isSimpleObject.js";

/**
 * Process a value so it can be debugged
 *
 * @param {any} value
 */
export default async function debugValue(value) {
  if (Tree.isMap(value)) {
    // Apply the debug transform to the map so that its values can be debugged
    value = debugTransform(value);
  } else if (isUnpackable(value)) {
    // Wrap the unpack method so that the result can be debugged
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
  } else if (isSimpleObject(value)) {
    // Return YAML but allow it to be further traversed
    // Serialize to YAML, but also allow the result to be further traversed
    const object = value;
    const yamlText = await toYaml(object);
    value = box(yamlText);
    value.unpack = () => debugTransform(object);
  } else if (Tree.isMaplike(value) && typeof value !== "function") {
    // Maplike but not a function, apply transform
    value = debugTransform(value);
  }

  return value;
}
