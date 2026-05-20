import { box } from "@weborigami/async-tree";
import { volatileSymbol } from "./symbols.js";

/**
 * Mark the indicated value as volatile so it won't be cached.
 */
export default function volatile(value) {
  const boxed = box(value);
  Object.defineProperty(boxed, volatileSymbol, {
    value: true,
    enumerable: false,
  });
  return boxed;
}
