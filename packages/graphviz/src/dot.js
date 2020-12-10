import { AsyncExplorable } from "@explorablegraph/core";
import { asyncGet, get } from "@explorablegraph/symbols";

export default async function dot(graph, rootLabel = "") {
  const graphArcs = await statements(graph, "", "/");
  return `digraph g {
  rankdir=LR;
${graphArcs.join("\n")}
}`;
}

async function statements(node, nodePath, nodeLabel) {
  let result = [];

  result.push(`  "${nodePath}" [label="${nodeLabel}"];`);

  for await (const key of node) {
    const destPath = `${nodePath}/${key}`;
    const arc = `  "${nodePath}" -> "${destPath}";`;
    result.push(arc);

    const value = node[get] ? node[get](key) : await node[asyncGet](key);
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
