import {
  Tree,
  box,
  isPlainObject,
  isPrimitive,
  isUnpackable,
} from "@weborigami/async-tree";
import { toYaml } from "../../common/serialize.js";
import debugTransform from "./debugTransform.js";

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

/**
 * Returns true if the object is "simple": a plain object or array that does not
 * have any getters in its deep structure.
 *
 * This test is used to avoid serializing complex objects to YAML.
 *
 * @param {any} object
 */
function isSimpleObject(object) {
  if (!(object instanceof Array || isPlainObject(object))) {
    return false;
  }

  for (const key of Object.keys(object)) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor) {
      continue; // not sure why this would happen
    } else if (typeof descriptor.get === "function") {
      return false; // Getters aren't simple
    } else if (isPrimitive(descriptor.value)) {
      continue; // Primitives are simple
    } else if (!isSimpleObject(descriptor.value)) {
      return false; // Deep structure wasn't simple
    }
  }

  return true;
}
