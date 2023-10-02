/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import TextDocument from "../common/TextDocument.js";
import { createTextDocument } from "../common/createTextDocument.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadOrigamiTemplate(container, input, key) {
  let templateContents;
  return new TextDocument(input, {
    parent: container,

    async contents() {
      if (!templateContents) {
        // Get the input body text.
        const inputDocument = createTextDocument(input, { parent: container });
        const bodyText = inputDocument.bodyText;

        // Compile the body text as an Origami expression and evaluate it.
        const expression = compile.templateDocument(bodyText);
        const containerScope = getScope(container) ?? builtins;
        const lambda = await expression.call(containerScope);

        const attachedData = await inputDocument?.contents?.();

        /** @this {AsyncDictionary|null} */
        templateContents = async function templateFn(input) {
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
        templateContents.code = lambda.code;
      }
      return templateContents;
    },
  });
}
