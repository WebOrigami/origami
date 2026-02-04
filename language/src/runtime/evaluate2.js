import * as compile from "../compiler/compile.js";

/**
 * Compile the given source code and evaluate it.
 *
 * @typedef {import("../../index.ts").Source} Source
 * @param {Source|string} source
 * @param {any} [options]
 */
export default async function evaluate2(source, options = {}) {
  const fn = compile.expression(source, options);
  const result = await fn();
  return result;
}
