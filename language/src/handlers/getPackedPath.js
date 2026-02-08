import { getParent } from "@weborigami/async-tree";
import path from "node:path";

/**
 * Return the path or file name for a packed value based on the options passed
 * to the unpack function.
 *
 * @param {import("@weborigami/async-tree").Packed} packed
 * @param {any} options
 */
export default function getPackedPath(packed, options = {}) {
  const { key } = options;
  /** @type {any} */
  const parent = getParent(packed, options);
  const filePath = parent?.path ? path.join(parent.path, key) : key;
  return filePath;
}
