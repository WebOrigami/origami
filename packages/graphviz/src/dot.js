import { Explorable } from "@explorablegraph/core";
import { get } from "@explorablegraph/symbols";

export function dot(graph, rootLabel = "") {
  const rootNode = `  root [shape=doublecircle, label="${rootLabel}"];`;

  const arcs = [];
  for (const key in graph) {
    const value = graph[get](key);
    const arc = `  root -> "${value}" [label="${key}"];`;
    arcs.push(arc);
  }

  return `digraph g {
  rankdir=LR;
${rootNode}
${arcs.join("\n")}
}`;
}

const g = Explorable({
  "index.html": "Hello, world.",
  a: "Hello, a.",
  b: "Hello, b.",
  c: "Hello, c.",
});

console.log(dot(g, "/"));
