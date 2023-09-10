import { DictionaryHelpers, GraphHelpers } from "@graphorigami/core";
import * as serialize from "../../common/serialize.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} variant
 */
export default async function table(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = GraphHelpers.from(variant);
  const firstValue = await valueForFirstKey(graph);
  if (DictionaryHelpers.isAsyncDictionary(firstValue)) {
    return fullTable(graph, firstValue);
  } else {
    return simpleTable(graph);
  }
}

// Graph's values are subgraphs.
//
// Return an R x C table, where R is the number of top-level keys in the graph
// (plus a header row), and C is the number of 2nd-level keys (plus a labeling
// column).
//
// The 2nd-level keys are obtain by inspecting the given model object, which is
// taken to represent top-level objects in the graph.
async function fullTable(graph, model) {
  // Construct the header.
  const modelKeys = Array.from(await model.keys());
  const header = " \t" + modelKeys.join("\t");
  const rows = [header];

  // Add a row for each top-level object.
  for (const key of await graph.keys()) {
    let row = key;
    const value = await graph.get(key);
    for (const modelKey of await model.keys()) {
      const value2 = await value.get(modelKey);
      row += `\t${value2}`;
    }
    rows.push(row);
  }

  return rows.join("\n");
}

// Graph's values are not subgraphs.
// Return the (key, value) pairs as a simple two-column table.
async function simpleTable(graph) {
  const header = `Key\tValue`;
  const rows = [header];
  for (const key of await graph.keys()) {
    const value = await graph.get(key);
    const valueText = serialize.toSerializable(value);
    rows.push(`${key}\t${valueText}`);
  }
  const text = rows.join("\n");
  return text;
}

// Return the value for the graph's first key.
async function valueForFirstKey(graph) {
  const [value] = await graph.keys();
  return value;
}

table.usage =
  "table <graph>\tFormat the graph's top level as a tab-delimited table";
table.documentation = "https://graphorigami.org/cli/builtins.html#table";
