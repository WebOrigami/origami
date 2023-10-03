/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import { createTextDocument } from "../common/createTextDocument.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadOrigamiTemplate(container, input, key) {
  return createTextDocument(input, {
    parent: container,

    async contents() {
      // Get the input body text and attached content.
      const inputDocument = createTextDocument(input, { parent: container });
      const bodyText = inputDocument.bodyText;
      const attachedData = await inputDocument.contents();

      // Compile the body text as an Origami expression and evaluate it.
      const expression = compile.templateDocument(bodyText);
      const containerScope = getScope(container) ?? builtins;
      const lambda = await expression.call(containerScope);

      /** @this {AsyncDictionary|null} */
      let templateContents = async function templateFn(input) {
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

      return templateContents;
    },
  });
}
