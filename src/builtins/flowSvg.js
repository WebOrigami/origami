import { graphviz } from "node-graphviz";

export default async function flowSvg(flow) {
  const dot = flowDot(flow);
  const svg = await graphviz.dot(dot, "svg");
  return svg;
}

function flowDot(flow) {
  const nodes = Object.keys(flow).map((key) => `  "${key}" [URL="${key}"];`);

  const edges = [];
  for (const [node, dependencies] of Object.entries(flow)) {
    for (const dependency of dependencies) {
      edges.push(`  "${dependency}" -> "${node}";`);
    }
  }

  return `digraph dataflow {
  nodesep=1;
  rankdir=LR;
  ranksep=1.5;
  node [color=gray70; fillcolor="white"; fontname="Helvetica"; fontsize="10"; nojustify=true; style="filled"; shape=box];
  edge [arrowhead=vee; arrowsize=0.75; color=gray60; fontname="Helvetica"; fontsize="10"; labeldistance=5];

${nodes.join("\n")}

${edges.join("\n")}
}`;
}
