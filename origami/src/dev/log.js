import yaml from "../origami/yaml.js";

/**
 * Log the first argument to the console as a side effect and return the second
 * argument. If no second argument is provided, return the first argument.
 *
 * @param {any} object
 * @param {any} [result]
 */
export default async function log(result, object = result) {
  let text = object !== undefined ? await yaml(object) : "undefined";
  text = text?.trim();
  console.log(text);
  return result;
}
