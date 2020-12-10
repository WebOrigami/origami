import { asyncOps } from "@explorablegraph/core";

export default async function strings(graph) {
  return await asyncOps.strings(graph);
}

strings.usage = `strings(graph)\tCast both the keys and values of the graph to strings`;
