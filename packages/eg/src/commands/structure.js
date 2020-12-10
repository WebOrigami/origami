import { asyncOps } from "@explorablegraph/core";

export default async function structure(graph) {
  return await asyncOps.structure(graph);
}

structure.usage = `structure(graph)\tA plain object with the structure of the graph but null values`;
