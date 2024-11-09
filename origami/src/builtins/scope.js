import { ops } from "@weborigami/language";
import helpRegistry from "../common/helpRegistry.js";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} key
 */
export default async function scope(key) {
  return ops.scope.call(this, key);
}

helpRegistry.set(
  "scope:",
  "URL protocol to explicitly reference a key in scope"
);
