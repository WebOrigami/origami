import { AsyncExplorable } from "@explorablegraph/core";
import { asyncGet, asyncKeys } from "@explorablegraph/symbols";

export default async function dot(graph, rootLabel = "") {
  const graphArcs = await statements(graph, "", "/");
  return `digraph g {
  rankdir=LR;
${graphArcs.join("\n")}
}`;
}

async function statements(graph, nodePath, nodeLabel) {
  let result = [];

  result.push(`  "${nodePath}" [label="${nodeLabel}"];`);

  for await (const key of graph[asyncKeys]()) {
    const destPath = `${nodePath}/${key}`;
    const arc = `  "${nodePath}" -> "${destPath}";`;
    result.push(arc);

    const value = await graph[asyncGet](key);
    if (value instanceof AsyncExplorable) {
      const subStatements = await statements(value, destPath, key);
      result = result.concat(subStatements);
    } else {
      result.push(`  "${destPath}" [label="${key}"];`);
    }
  }
  return result;
}

dot.usage = `dot(graph)\tRender a graph visually in dot language`;
