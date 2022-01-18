import ExplorableGraph from "../../core/ExplorableGraph.js";
import { toSerializable } from "../../core/utilities.js";

export default async function table(variant) {
  const graph = ExplorableGraph.from(variant);
  const firstValue = await valueForFirstKey(graph);
  if (ExplorableGraph.isExplorable(firstValue)) {
    return await fullTable(graph, firstValue);
  } else {
    return await simpleTable(graph);
  }
}

// Graph's values are explorable.
//
// Return an R x C table, where R is the number of top-level keys in the graph
// (plus a header row), and C is the number of 2nd-level keys (plus a labeling
// column).
//
// The 2nd-level keys are obtain by inspecting the given model object, which is
// taken to represent top-level objects in the graph.
async function fullTable(graph, model) {
  // Construct the header.
  const modelKeys = await ExplorableGraph.keys(model);
  const header = " \t" + modelKeys.join("\t");
  const rows = [header];

  // Add a row for each top-level object.
  for await (const key of graph) {
    let row = key;
    const value = await graph.get(key);
    for await (const modelKey of model) {
      const value2 = await value.get(modelKey);
      row += `\t${value2}`;
    }
    rows.push(row);
  }

  return rows.join("\n");
}

// Graph's values are not explorable.
// Return the (key, value) pairs as a simple two-column table.
async function simpleTable(graph) {
  const header = `Key\tValue`;
  const rows = [header];
  for await (const key of graph) {
    const value = await graph.get(key);
    const valueText = toSerializable(value);
    rows.push(`${key}\t${valueText}`);
  }
  const text = rows.join("\n");
  return text;
}

// Return the value for the graph's first key.
async function valueForFirstKey(graph) {
  let value;
  for await (const key of graph) {
    value = await graph.get(key);
    break;
  }
  return value;
}

table.usage =
  "table <graph>\tFormat the graph's top level as a tab-delimited table";
