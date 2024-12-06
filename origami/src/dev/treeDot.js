import {
  Tree,
  isPlainObject,
  isStringLike,
  toString,
  trailingSlash,
} from "@weborigami/async-tree";
import * as serialize from "../common/serialize.js";
import { getDescriptor } from "../common/utilities.js";

/**
 * Render a tree in DOT format.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {PlainObject} [options]
 */
export default async function dot(treelike, options = {}) {
  const tree = Tree.from(treelike, { deep: true });
  const rootLabel = getDescriptor(tree) ?? "";
  const treeArcs = await statements(tree, "", rootLabel, options);
  return `digraph g {
  bgcolor="transparent";
  nodesep=1;
  rankdir=LR;
  ranksep=1.5;
  node [color=gray70; fillcolor="white"; fontname="Helvetica"; fontsize="10"; nojustify=true; style="filled"; shape=box];
  edge [arrowhead=vee; arrowsize=0.75; color=gray60; fontname="Helvetica"; fontsize="10"; labeldistance=5];

${treeArcs.join("\n")}
}`;
}

async function statements(tree, nodePath, nodeLabel, options) {
  let result = [];
  const createLinks = options.createLinks ?? true;

  // Add a node for the root of this (sub)tree.
  const rootUrl = nodePath || ".";
  const url = createLinks ? `; URL="${rootUrl}"` : "";
  const rootLabel = nodeLabel ? `; xlabel="${nodeLabel}"` : "";
  result.push(
    `  "${nodePath}" [shape=circle${rootLabel}; label=""; color=gray40; width=0.15${url}];`
  );

  // Draw edges and collect labels for the nodes they lead to.
  let nodes = new Map();
  for (const key of await tree.keys()) {
    const destPath = nodePath ? `${trailingSlash.add(nodePath)}${key}` : key;
    const labelUrl = createLinks ? `; labelURL="${destPath}"` : "";
    const arc = `  "${nodePath}" -> "${destPath}" [label="${key}"${labelUrl}];`;
    result.push(arc);

    let isError = false;
    let value;
    try {
      value = await tree.get(key);
    } catch (/** @type {any} */ error) {
      isError = true;
      value =
        error.name && error.message
          ? `${error.name}: ${error.message}`
          : error.name ?? error.message ?? error;
    }

    const expandable =
      value instanceof Array || isPlainObject(value) || Tree.isAsyncTree(value);
    if (expandable) {
      const subtree = Tree.from(value);
      const subStatements = await statements(subtree, destPath, null, options);
      result = result.concat(subStatements);
    } else {
      const label = isStringLike(value)
        ? toString(value)
        : value !== undefined
        ? await serialize.toYaml(value)
        : "";
      if (value === undefined) {
        isError = true;
      }

      const data = { label };
      if (isError) {
        data.isError = true;
      }
      nodes.set(key, data);
    }
  }

  // If we have more than one label, we'll focus on the labels' differences.
  // We'll use the first label as a representative baseline for all labels but
  // the first (which will use the second label as a baseline).
  const values = [...nodes.values()];
  const showLabelDiffs = values.length > 1;
  const label1 = showLabelDiffs ? String(values[0].label) : undefined;
  const label2 = showLabelDiffs ? String(values[1].label) : undefined;

  // Trim labels.
  let i = 0;
  for (const data of nodes.values()) {
    let label = data.label;
    if (label === null) {
      data.label = "[binary data]";
    } else if (label) {
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

      label = label.trim();

      if (label.length > 40) {
        // Long text, just use the beginning
        label = label.slice(0, 40);
        clippedEnd = true;
      }

      // Left justify node label using weird Dot escape character
      // See https://stackoverflow.com/a/13104953/76472
      const endsWithNewline = label.endsWith("\n");
      label = label.replace(/\n/g, "\\l");

      label = label.replace(/"/g, '\\"'); // Escape quotes
      label = label.replace(/[\ \t]+/g, " "); // Collapse spaces and tabs

      // Add ellipses if we clipped the label. We'd prefer to end with a real
      // ellipsis, but GraphViz warns about "non-ASCII character 226" if we do.
      // (That's not even the ellipsis character!) We could use a real ellipsis
      // for the start, but then they might look different.
      if (clippedStart) {
        label = "..." + label;
      }
      if (clippedEnd) {
        label += "...";
      }

      if (!endsWithNewline) {
        // See note above
        label += "\\l";
      }

      data.label = label;
    }
    i++;
  }

  // Draw labels.
  for (const [key, node] of nodes.entries()) {
    const icon = node.isError ? "⚠️ " : "";
    // GraphViz has trouble rendering DOT nodes whose labels contain ellipsis
    // characters, so we map those to three periods. GraphViz appears to turn
    // those back into ellipsis characters when rendering the graph.
    const text = node.label.replace(/…/g, "...");
    const label = `label="${icon}${text}"`;
    const color = node.isError ? `; color="red"` : "";
    const fill = node.isError ? `; fillcolor="#FFF4F4"` : "";
    const destPath = nodePath ? `${trailingSlash.add(nodePath)}${key}` : key;
    const url = createLinks ? `; URL="${destPath}"` : "";
    result.push(`  "${destPath}" [${label}${color}${fill}${url}];`);
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
