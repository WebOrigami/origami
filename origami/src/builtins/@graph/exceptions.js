import { Dictionary, Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";
import defineds from "./defineds.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} graphable
 */
export default async function exceptions(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  const exceptionsGraph = new ExceptionsGraph(graphable);
  return defineds.call(this, exceptionsGraph);
}

class ExceptionsGraph {
  constructor(graphable) {
    this.graph = Graph.from(graphable);
  }

  async get(key) {
    try {
      const value = await this.graph.get(key);
      return Dictionary.isAsyncDictionary(value)
        ? Reflect.construct(this.constructor, [value])
        : undefined;
    } catch (/** @type {any} */ error) {
      return error.name && error.message
        ? `${error.name}: ${error.message}`
        : error.name ?? error.message ?? error;
    }
  }

  async keys() {
    return this.graph.keys();
  }
}

exceptions.usage = `@graph/exceptions graph\tReturn a graph of exceptions thrown in the graph`;
exceptions.documentation =
  "https://graphorigami.org/cli/builtins.html#exceptions";
