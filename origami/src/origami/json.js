import { isUnpackable, toPlainValue } from "@weborigami/async-tree";

/**
 * Render the given object in JSON format.
 *
 *
 * @param {any} [obj]
 */
export default async function json(obj) {
  if (arguments.length > 0 && obj === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  if (obj === undefined) {
    return undefined;
  }
  if (isUnpackable(obj)) {
    obj = await obj.unpack();
  }
  const value = await toPlainValue(obj);
  return JSON.stringify(value, null, 2);
}
