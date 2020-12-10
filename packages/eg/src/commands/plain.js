import { asyncOps } from "@explorablegraph/core";

export default async function plain(graph) {
  return await asyncOps.plain(graph);
}

plain.usage = `plain(graph)\tA plain JavaScript object representation of the graph`;
