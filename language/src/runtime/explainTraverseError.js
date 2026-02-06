import { trailingSlash, TraverseError, Tree } from "@weborigami/async-tree";
import { typos } from "./typos.js";

/**
 * Try to provide a more helpful message for a TraverseError by analyzing the
 * code and suggesting possible typos.
 *
 * @param {TraverseError} error
 */
export default async function explainTraverseError(error) {
  const { lastValue, keys, position } = error;
  if (lastValue === undefined || keys === undefined || position === undefined) {
    // Don't have sufficient information; shouldn't happen
    return null;
  }

  if (position === 0) {
    // Shouldn't happen; should have been a ReferenceError
    return null;
  }

  // The key that caused the error is the one before the current position
  const path = keys
    .slice(0, position)
    .map((key, index) => trailingSlash.toggle(key, index < position - 1))
    .join("");
  let message = `The path traversal ended unexpectedly at: ${path}`;

  const key = trailingSlash.remove(keys[position - 1]);

  const lastValueKeys = await Tree.keys(lastValue);
  const normalizedKeys = lastValueKeys.map(trailingSlash.remove);

  const possibleTypos = typos(key, normalizedKeys);
  if (possibleTypos.length > 0) {
    message += "\nPerhaps you intended";
    if (possibleTypos.length > 1) {
      message += " one of these";
    }
    message += ": ";

    const withLeadingSlashes =
      position > 1 ? possibleTypos.map((key) => `/${key}`) : possibleTypos;
    message += withLeadingSlashes.join(", ");
  }

  return message;
}
