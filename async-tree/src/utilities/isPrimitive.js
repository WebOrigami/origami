/**
 * Return true if the value is a primitive JavaScript value.
 *
 * @param {any} value
 */
export default function isPrimitive(value) {
  // Check for null first, since typeof null === "object".
  if (value === null) {
    return true;
  }
  const type = typeof value;
  return type !== "object" && type !== "function";
}
