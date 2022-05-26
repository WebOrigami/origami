import { graphviz } from "node-graphviz";

export default async function flowSvg(flow) {
  const dot = flowDot(flow);
  const svg = await graphviz.dot(dot, "svg");
  return svg;
}

function flowDot(flow) {
  const nodes = [];
  const edges = [];
  for (const [key, record] of Object.entries(flow)) {
    const dependencies = record.dependencies ?? [];
    const virtualNode = dependencies.length > 0;
    const nodeLabel = record.label ? `label="${record.label}"` : null;
    const nodeUrl = `URL="${key}"`;
    const nodeStyle = virtualNode ? `style="dashed"` : null;
    const attributes = [nodeLabel, nodeUrl, nodeStyle].filter(attribute => attribute);
    const nodeDot = `  "${key}" [${attributes.join("; ")}];`;
    nodes.push(nodeDot);

    for (const dependency of dependencies) {
      edges.push(`  "${dependency}" -> "${key}";`);
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
