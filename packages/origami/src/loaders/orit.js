/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import TextDocument from "../common/TextDocument.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("../../index.js").Deserializer}
 */
export default async function deserializeOrigamiTemplate(container, input) {
  // Get the input body text and attached content.
  const inputDocument = TextDocument.from(input);
  const text = inputDocument.text;
  const attachedData = await inputDocument.data;

  // Compile the body text as an Origami expression and evaluate it.
  const expression = compile.templateDocument(text);
  const containerScope = getScope(container) ?? builtins;
  const lambda = await expression.call(containerScope);

  /** @this {AsyncDictionary|null} */
  let result = async function templateFn(input) {
    const baseScope = this ?? builtins;
    const extendedScope = new Scope(
      {
        "@container": container,
        "@callScope": containerScope,
        "@attached": attachedData,
      },
      baseScope
    );
    return lambda.call(extendedScope, input);
  };

  // Add diagnostic information.
  // @ts-ignore
  result.code = lambda.code;

  return result;
}
