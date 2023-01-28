import FileLoadersTransform from "../common/FileLoadersTransform.js";
import execute from "../language/execute.js";
import * as ops from "../language/ops.js";
import { objectDefinitions } from "../language/parse.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import PathTransform from "./PathTransform.js";

class OrigamiGraphBase {
  constructor(definitions) {
    // If the definition is text parse it, otherwise use as is.
    if (typeof definitions === "string") {
      const parsed = objectDefinitions(definitions);
      const code = parsed?.value;
      if (!parsed || parsed.rest !== "" || !isGraphCode(code)) {
        console.error(`could not parse as an Origami graph: ${definitions}`);
        return;
      }
      this.properties = code[1] || {};
      this.formulas = code[2] || {};
    } else {
      this.properties = definitions.properties ?? {};
      this.formulas = definitions.formulas ?? {};
    }
  }

  async *[Symbol.asyncIterator]() {
    yield* Object.keys(this.properties);
    yield* Object.keys(this.formulas);
  }

  async get(key) {
    if (key === undefined) {
      // Getting undefined returns the graph itself.
      return this;
    }

    // Try properties first.
    let value = this.properties[key];
    if (value !== undefined) {
      if (isGraphCode(value)) {
        const [_, properties, formulas] = value;
        value = Reflect.construct(this.constructor, [{ properties, formulas }]);
      }
      return value;
    }

    // Then try formulas.
    const formula = this.formulas[key];
    if (formula) {
      const scope = this.scope ?? this;
      value = await execute.call(scope, formula);
    }
    return value;
  }
}

function isGraphCode(obj) {
  return obj?.[0] === ops.graph || obj?.[0] === ops.object;
}

export default class OrigamiGraph extends PathTransform(
  InheritScopeTransform(FileLoadersTransform(OrigamiGraphBase))
) {}
