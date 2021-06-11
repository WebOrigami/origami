import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function dot(graph) {
  const graphArcs = await statements(graph, "", "/");
  //   node [label=""; shape=circle; width=0.25];
  return `digraph g {
  rankdir=LR;
  node [shape=none];
  edge [arrowhead=vee; arrowsize=0.75];

${graphArcs.join("\n")}
}`;
}

async function statements(graph, nodePath, nodeLabel) {
  let result = [];

  // result.push(`  "${nodePath}" [label="${nodeLabel}"];`);
  result.push(`  "${nodePath}" [label=""; shape=circle; width=0.10];`);

  for await (const key of graph) {
    const destPath = `${nodePath}/${key}`;
    const arc = `  "${nodePath}" -> "${destPath}" [label="${key}"];`;
    result.push(arc);

    const value = await graph.get(key);
    if (ExplorableGraph.isExplorable(value)) {
      const subStatements = await statements(value, destPath, key);
      result = result.concat(subStatements);
    } else {
      let label = value?.toString?.();
      if (label) {
        if (label.length > 20) {
          label = label.slice(0, 20) + "…";
        }
        result.push(`  "${destPath}" [label="${label}"; shape=box];`);
      }
    }
  }
  return result;
}

dot.usage = `dot(graph)\tRender a graph visually in dot language`;
