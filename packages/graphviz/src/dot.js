import { asyncGet } from "@explorablegraph/symbols";

export default async function dot(graph, rootLabel = "") {
  const rootNode = `  root [shape=doublecircle, label="${rootLabel}"];`;

  const arcs = [];
  for (const key in graph) {
    const value = await graph[asyncGet](key);
    const arc = `  root -> "${value}" [label="${key}"];`;
    arcs.push(arc);
  }

  return `digraph g {
  rankdir=LR;
${rootNode}
${arcs.join("\n")}
}`;
}

dot.usage = `dot(graph) Show the dots`;
