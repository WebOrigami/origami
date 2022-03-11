import YAML from "yaml";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { toSerializable } from "../core/utilities.js";

/**
 * Render a graph in DOT format.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function dot(variant) {
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  const graphArcs = await statements(graph, "");
  return `digraph g {
  bgcolor="transparent";
  nodesep=1;
  rankdir=LR;
  ranksep=1.5;
  node [shape=box; color=gray70; fillcolor="white"; fontname="Helvetica"; fontsize="10"; style="filled"];
  edge [arrowhead=vee; arrowsize=0.75; color=gray60; fontname="Helvetica"; labeldistance=5];

${graphArcs.join("\n")}
}`;
}

async function statements(graph, nodePath) {
  let result = [];

  result.push(
    `  "${nodePath}" [label=""; shape=circle; color=gray40; width=0.10];`
  );

  // Draw edges and collect labels for the nodes they lead to.
  let labels = {};
  for await (const key of graph) {
    const destPath = `${nodePath}/${key}`;
    const arc = `  "${nodePath}" -> "${destPath}" [label="${key}"];`;
    result.push(arc);

    const value = await graph.get(key);
    if (ExplorableGraph.isExplorable(value)) {
      const destPath = `${nodePath}/${key}`;
      const subStatements = await statements(value, destPath);
      result = result.concat(subStatements);
    } else {
      const serializable = value ? toSerializable(value) : undefined;
      let label =
        typeof serializable === "object"
          ? YAML.stringify(serializable)
          : serializable ?? "";
      labels[key] = label;
    }
  }

  // If we have more than one label, we'll focus on the labels' differences.
  // We'll use the first label as a representative baseline for all labels but
  // the first (which will use the second label as a baseline).
  const values = Object.values(labels);
  const showLabelDiffs = values.length > 1;
  const label1 = showLabelDiffs ? String(values[0]) : undefined;
  const label2 = showLabelDiffs ? String(values[1]) : undefined;

  // Trim labels.
  let i = 0;
  for (const key of Object.keys(labels)) {
    let label = String(labels[key]);
    if (label) {
      let clippedStart = false;
      let clippedEnd = false;

      if (showLabelDiffs) {
        const baseline = i === 0 ? label2 : label1;
        const diff = stringDiff(baseline, label);
        if (diff !== label) {
          label = diff;
          clippedStart = true;
        }
      }

      if (label.length > 40) {
        // Long text, just use the beginning
        label = label.slice(0, 40);
        clippedEnd = true;
      }
      label = label.replace(/\n/g, " "); // Remove newlines
      label = label.replace(/"/g, '\\"'); // Escape quotes
      label = label.replace(/\s+/g, " "); // Collapse whitespace
      label = label.replace(/[\u{0080}-\u{FFFF}]/gu, ""); // Remove non-ASCII characters

      if (clippedStart) {
        label = "…" + label;
      }
      if (clippedEnd) {
        label += "…";
      }

      labels[key] = label;
    }
    i++;
  }

  // Draw labels.
  for (const key in labels) {
    const destPath = `${nodePath}/${key}`;
    const label = labels[key];
    result.push(`  "${destPath}" [label="${label}"];`);
  }

  return result;
}

// Return the second string, removing the initial portion it shares with the
// first string. The returned string will start with the first non-whitespace
// character of the first line that differs from the first string.
function stringDiff(first, second) {
  let i = 0;
  // Find point of first difference.
  while (i < first.length && i < second.length && first[i] === second[i]) {
    i++;
  }
  // Back up to start of that line.
  while (i > 0 && second[i - 1] !== "\n") {
    i--;
  }
  // Move forward to first non-whitespace character.
  while (i < second.length && /\s/.test(second[i])) {
    i++;
  }
  return second.slice(i);
}

dot.usage = `dot <graph>\tRender a graph visually in dot language`;
dot.documentation = "https://explorablegraph.org/cli/builtins.html#dot";
