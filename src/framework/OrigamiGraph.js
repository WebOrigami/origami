import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import execute from "../language/execute.js";
import { graphDocument } from "../language/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import PathTransform from "./PathTransform.js";

class OrigamiGraphBase {
  constructor(definition) {
    // If the definition is text parse it, otherwise use as is.
    let formulas;
    if (typeof definition === "string") {
      const parsed = graphDocument(definition);
      if (!parsed || parsed.rest !== "") {
        throw new Error(`Couldn't parse Origami graph: ${definition}`);
      }
      formulas = parsed.value[1];
    } else {
      formulas = definition;
    }
    this.formulas = formulas ?? {};
  }

  async *[Symbol.asyncIterator]() {
    yield* Object.keys(this.formulas);
  }

  async get(key) {
    if (key === undefined) {
      // Getting undefined returns the graph itself.
      return this;
    }

    const formula = this.formulas[key];
    let value;
    if (formula) {
      const scope = this.scope ?? this;
      value = await execute.call(scope, formula);
    }

    return value;
  }
}

export default class OrigamiGraph extends PathTransform(
  InheritScopeTransform(
    FileLoadersTransform(ImplicitModulesTransform(OrigamiGraphBase))
  )
) {}
