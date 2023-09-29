/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Graph } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import ExpressionGraph from "../common/ExpressionGraph.js";
import Scope from "../common/Scope.js";
import TextWithContents from "../common/TextWithContents.js";
import { extractFrontMatter } from "../common/serialize.js";
import { getScope } from "../common/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadOrigamiTemplate(container, input, key) {
  const containerScope = getScope(container) ?? builtins;
  let contents;
  return new TextWithContents(input, async () => {
    if (!contents) {
      let bodyText;
      let frontGraph;

      if (input.contents) {
        bodyText = String(input);
        frontGraph = Graph.from(await input.contents());
      } else {
        const extracted = extractFrontMatter(input);
        bodyText = extracted.bodyText;
        const frontData = extracted.frontData;
        if (frontData) {
          frontGraph = new (FileTreeTransform(ExpressionGraph))(frontData);
        }
      }
      if (frontGraph) {
        frontGraph.parent = containerScope;
      }

      // Compile the file's text as an Origami expression and evaluate it.
      const expression = compile.templateDocument(bodyText);
      const lambda = await expression.call(containerScope);

      /** @this {AsyncDictionary|null} */
      contents = async function templateFn(input) {
        const baseScope = this ?? builtins;
        const extendedScope = new Scope(
          {
            "@container": container,
            "@caller": getScope(input?.parent),
            "@template": frontGraph,
          },
          baseScope
        );
        return lambda.call(extendedScope, input);
      };

      // Add diagnostic information.
      // @ts-ignore
      contents.code = lambda.code;
    }
    return contents;
  });
}
