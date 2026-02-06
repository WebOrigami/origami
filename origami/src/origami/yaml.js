import { isUnpackable, toPlainValue } from "@weborigami/async-tree";
import YAML from "yaml";

/**
 * Render the object as text in YAML format.
 *
 * @param {any} obj
 */
export default async function yamlBuiltin(obj) {
  if (obj === undefined) {
    return undefined;
  }
  if (isUnpackable(obj)) {
    obj = await obj.unpack();
  }
  const value = await toPlainValue(obj);
  return YAML.stringify(value);
}
