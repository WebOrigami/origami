import isPrimitive from "./isPrimitive.js";
import isStringlike from "./isStringlike.js";
import TypedArray from "./TypedArray.js";

const textDecoder = new TextDecoder();

/**
 * Return a string form of the object, handling cases not generally handled by
 * the standard JavaScript `toString()` method:
 *
 * 1. If the object is an ArrayBuffer or TypedArray, decode the array as UTF-8.
 * 2. If the object is otherwise a plain JavaScript object with the useless
 *    default toString() method, return null instead of "[object Object]". In
 *    practice, it's generally more useful to have this method fail than to
 *    return a useless string.
 * 3. If the object is a defined primitive value, return the result of
 *    String(object).
 *
 * Otherwise return null.
 *
 * @param {any} object
 * @returns {string|null}
 */
export default function toString(object) {
  if (object instanceof ArrayBuffer || object instanceof TypedArray) {
    // Treat the buffer as UTF-8 text.
    const decoded = textDecoder.decode(object);
    // If the result appears to contain non-printable characters, it's probably not a string.
    // https://stackoverflow.com/a/1677660/76472
    const hasNonPrintableCharacters = /[\x00-\x08\x0E-\x1F]/.test(decoded);
    return hasNonPrintableCharacters ? null : decoded;
  } else if (isStringlike(object) || (object !== null && isPrimitive(object))) {
    return String(object);
  } else {
    return null;
  }
}
