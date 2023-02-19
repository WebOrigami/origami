import toYaml from "../builtins/yaml.js";

/**
 *
 * @param {Explorable} scope
 * @param {any} result
 * @returns {Promise<string | String | Buffer | undefined>}
 */
export default async function formatOriResult(scope, result) {
  const stringOrBuffer =
    typeof result === "string" ||
    (globalThis.Buffer && result instanceof Buffer);
  let output = stringOrBuffer
    ? result
    : result instanceof String
    ? result.toString()
    : result !== undefined
    ? await toYaml.call(scope, result)
    : undefined;
  return output;
}
