import ExpressionGraph from "../common/ExpressionGraph.js";
import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import Expression from "../language/Expression.js";
import { graphDocument } from "../language/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import PathTransform from "./PathTransform.js";

class OrigamiGraphBase extends ExpressionGraph {
  constructor(definition) {
    // If the definition is text parse it, otherwise use as is.
    if (typeof definition === "string") {
      const parsed = graphDocument(definition);
      if (!parsed || parsed.rest !== "") {
        throw new Error(`Couldn't parse Origami graph: ${definition}`);
      }
      const assignments = parsed.value[1];
      const expressions = {};
      for (const key in assignments) {
        const value = assignments[key];
        const expression =
          value instanceof Array ? new Expression(value) : value;
        expressions[key] = expression;
      }
      definition = expressions;
    }
    super(definition);
  }
}

export default class OrigamiGraph extends PathTransform(
  InheritScopeTransform(
    FileLoadersTransform(ImplicitModulesTransform(OrigamiGraphBase))
  )
) {}
