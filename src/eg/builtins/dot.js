import YAML from "yaml";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { toSerializable } from "../../core/utilities.js";

/**
 * Render a graph in DOT format.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function dot(variant) {
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  const graphArcs = await statements(graph, "", "/");
  return `digraph g {
  nodesep=.75;
  rankdir=LR;
  ranksep=1.5;
  node [shape=box; color=gray70; fontname="Helvetica"];
  edge [arrowhead=vee; arrowsize=0.75; color=gray60; fontname="Helvetica"; labeldistance=4];

${graphArcs.join("\n")}
}`;
}

async function statements(graph, nodePath, nodeLabel) {
  let result = [];

  result.push(
    `  "${nodePath}" [label=""; shape=circle; width=0.10; color=gray40];`
  );

  for await (const key of graph) {
    const destPath = `${nodePath}/${key}`;
    const arc = `  "${nodePath}" -> "${destPath}" [headlabel="${key}"];`;
    result.push(arc);

    const value = await graph.get(key);
    if (ExplorableGraph.isExplorable(value)) {
      const subStatements = await statements(value, destPath, key);
      result = result.concat(subStatements);
    } else {
      const serializable = value ? toSerializable(value) : undefined;
      let label =
        typeof serializable === "object"
          ? YAML.stringify(serializable)
          : serializable ?? "";
      if (label) {
        if (label.length > 20) {
          // Long text, just use the beginning
          label = label.slice(0, 20) + "…";
        }
        label = label.replace(/\n/g, " "); // Remove newlines
        label = label.replace(/"/g, '\\"'); // Escape quotes
        label = label.replace(/\s+/g, " "); // Collapse whitespace
        label = label.replace(/[\u{0080}-\u{FFFF}]/gu, ""); // Remove non-ASCII characters
      }
      result.push(`  "${destPath}" [label="${label}"];`);
    }
  }
  return result;
}

dot.usage = `dot <graph>\tRender a graph visually in dot language`;
dot.documentation = "https://explorablegraph.org/pika/builtins.html#dot";
