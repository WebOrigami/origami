/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import TextFile from "../common/TextFile.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadOrigamiTemplate(container, input, key) {
  const containerScope = getScope(container) ?? builtins;
  let templateContents;
  return new TextFile(input, {
    async contents() {
      if (!templateContents) {
        // Compile the file's text as an Origami expression and evaluate it.
        const bodyText = TextFile.bodyText(input);
        const expression = compile.templateDocument(bodyText);
        const lambda = await expression.call(containerScope);

        const attachedData = await TextFile.contents(input);
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
