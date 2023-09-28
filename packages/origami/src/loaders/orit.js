/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import ExpressionGraph from "../common/ExpressionGraph.js";
import Scope from "../common/Scope.js";
import TextWithContents from "../common/TextWithContents.js";
import { extractFrontMatter } from "../common/serialize.js";
import { getScope, keySymbol } from "../common/utilities.js";
import FileTreeTransform from "../framework/FileTreeTransform.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami template from a file.
 *
 * @param {import("../../index.js").StringLike} buffer
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadOrigamiTemplate(buffer, key) {
  const scope = this ? getScope(this) : builtins;
  return new TextWithContents(buffer, async () => {
    const { bodyText, frontData } = extractFrontMatter(buffer);

    // Compile the file's text as an Origami expression and evaluate it.
    const expression = compile.templateDocument(bodyText);
    const lambda = await expression.call(scope);

    let frontGraph;
    if (frontData) {
      frontGraph = new (FileTreeTransform(ExpressionGraph))(frontData);
      frontGraph.parent = scope;
    }

    const templateFn = async (input) => {
      const extendedScope = new Scope(
        {
          "@context": this,
          "@template": frontGraph,
        },
        scope
      );
      return lambda.call(extendedScope, input);
    };

    // Add diagnostic information to any (non-plain) object result.
    templateFn.code = lambda.code;
    templateFn[keySymbol] = key;

    return templateFn;
  });
}
