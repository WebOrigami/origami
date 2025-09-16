/**
 * Return the value as an object. If the value is already an object it will be
 * returned as is. If the value is a primitive, it will be wrapped in an object:
 * a string will be wrapped in a String object, a number will be wrapped in a
 * Number object, and a boolean will be wrapped in a Boolean object.
 *
 * @param {any} value
 */
export default function box(value) {
  switch (typeof value) {
    case "string":
      return new String(value);
    case "number":
      return new Number(value);
    case "boolean":
      return new Boolean(value);
    default:
      return value;
  }
}
