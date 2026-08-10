import { isPlainObject, isPrimitive } from "@weborigami/async-tree";

/**
 * Returns true if the object is "simple": a plain object or array that does not
 * have any getters in its deep structure.
 *
 * This test is used to avoid serializing complex objects to YAML.
 *
 * @param {any} object
 */
export default function isSimpleObject(object) {
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
