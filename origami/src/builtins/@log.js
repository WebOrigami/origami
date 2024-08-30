import logFn from "./@logFn.js";

/**
 * Log the first argument to the console as a side effect and return the second
 * argument. If no second argument is provided, return the first argument.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {any} object
 * @param {any} [result]
 */
export default async function log(result, object = result) {
  return logFn.call(this, object)(result);
}
