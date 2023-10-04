/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import TextDocument from "../common/TextDocument.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("../../index.js").FileUnpackFunction}
 */
export default async function unpackOrigamiTemplate(input, options = {}) {
  const { parent } = options;
  // Get the input body text and attached content.
  const inputDocument = TextDocument.from(input);
  const text = inputDocument.text;
  const attachedData = await inputDocument.data;

  // Compile the body text as an Origami expression and evaluate it.
  const expression = compile.templateDocument(text);
  const parentScope = parent ? getScope(parent) : builtins;
  const lambda = await expression.call(parentScope);

  /** @this {AsyncDictionary|null} */
  let result = async function templateFn(input) {
    const baseScope = this ?? builtins;
    const extendedScope = new Scope(
      {
        "@container": parent,
        "@callScope": parentScope,
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
