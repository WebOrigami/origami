import ExpressionGraph from "../common/ExpressionGraph.js";
import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import expressionFunction from "../language/expressionFunction.js";
import { graphDocument } from "../language/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import PathTransform from "./PathTransform.js";

class OrigamiGraphBase extends ExpressionGraph {
  constructor(definition) {
    // If the definition is text, then parse it; otherwise use as is.
    let assignments;
    if (typeof definition === "string") {
      const parsed = graphDocument(definition);
      if (!parsed || parsed.rest !== "") {
        throw new Error(`Couldn't parse Origami graph: ${definition}`);
      }
      assignments = parsed.value[1];
    } else {
      assignments = definition;
    }

    // Map arrays representing Origami code to functions.
    const expressions = {};
    for (const key in assignments) {
      const value = assignments[key];
      const expression =
        value instanceof Array ? expressionFunction(value) : value;
      expressions[key] = expression;
    }

    super(expressions);
  }
}

export default class OrigamiGraph extends PathTransform(
  InheritScopeTransform(
    FileLoadersTransform(ImplicitModulesTransform(OrigamiGraphBase))
  )
) {}
