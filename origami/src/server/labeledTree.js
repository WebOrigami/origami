import { box, isPlainObject, trailingSlash } from "@weborigami/async-tree";

/**
 * Given an object that has a `value` property and other children, return an
 * object (potentially boxed) with the top value that also supports the
 * AsyncTree interface to get the other children.
 *
 * @param {any} object
 */
export default function labeledTree(object) {
  if (object == null) {
    return object;
  }

  const value =
    typeof object.value === "object" ? object.value : box(object.value);
  value.get = async (key) => {
    const normalizedKey = trailingSlash.remove(key);
    const value = object[normalizedKey];
    return isPlainObject(value) ? labeledTree(value) : object[key];
  };
  value.keys = async () => Object.keys(object);

  return value;
}
