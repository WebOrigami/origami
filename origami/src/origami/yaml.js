import { isUnpackable } from "@weborigami/async-tree";
import { toYaml } from "../common/serialize.js";

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
  return toYaml(obj);
}
