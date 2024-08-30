import yaml from "./@yaml.js";

/**
 * Log the first argument to the console as a side effect and return the second
 * argument. If no second argument is provided, return the first argument.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {any} object
 */
export default function logFn(object) {
  const tree = this;
  /**
   * @param {any} arg
   */
  return async function (arg) {
    const text = (await yaml.call(tree, object))?.trim();
    console.log(text);
    return arg;
  };
}
