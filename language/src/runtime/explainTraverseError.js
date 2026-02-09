import {
  extension,
  isPacked,
  pathFromKeys,
  trailingSlash,
  TraverseError,
  Tree,
} from "@weborigami/async-tree";
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

  // Missing an extension handler?
  if (isPacked(lastValue) && typeof lastValue.unpack !== "function") {
    const ext = extension.extname(key);
    if (ext) {
      message += `\nThe value couldn't be unpacked because no file extension handler is registered for "${ext}".`;
    }
  } else {
    const lastValueKeys = await Tree.keys(lastValue);
    const normalizedKeys = lastValueKeys.map(trailingSlash.remove);

    const keyAsNumber = Number(key);
    if (!isNaN(keyAsNumber)) {
      // See if the string version of the key is present
      if (lastValueKeys.includes(keyAsNumber)) {
        const suggestedPath = `${pathFromKeys(keys.slice(0, position - 1))}(${keyAsNumber})`;
        message += `\nSlash-separated keys are searched as strings. Here there's no string "${key}" key, but there is a number ${keyAsNumber} key.
To get the value for that number key, use parentheses: ${suggestedPath}`;
      }
    } else {
      // Suggest typos
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
    }
  }

  return message;
}
