import { toString } from "../common/utilities.js";

/**
 * Return the tree structure of a markdown document.
 *
 * @typedef {import("@weborigami/async-tree").StringLike} StringLike
 * @typedef {import("@weborigami/async-tree").Unpackable<StringLike>}
 * UnpackableStringlike
 *
 * @this {import("@weborigami/types").AsyncTree|null|void}
 * @param {StringLike|UnpackableStringlike} input
 */
export default function mdStructure(input) {
  const markdown = toString(input);
  if (markdown === null) {
    throw new Error("No markdown text provided.");
  }

  // The document acts as an entry for heading level zero. All level one
  // headings will end up as its children.
  const document = {};
  const activeHeadings = [document];

  // Split the text by lines that contain markdown headings.
  const lines = markdown.split("\n");
  lines.forEach((line) => {
    const match = line.match(/^(?<levelMarkers>#{1,6})\s(?<heading>.*)$/);
    if (!match?.groups) {
      return;
    }
    const { levelMarkers, heading } = match.groups;
    const level = levelMarkers.length;

    // If we've gone up a level (or more), pop completed entries off the stack.
    while (activeHeadings.length > level) {
      activeHeadings.pop();
    }

    // If we've skipped a level (or more), add intermediate entries using
    // symbols to avoid name collisions.
    while (activeHeadings.length < level) {
      const entry = {};
      const parentEntry = activeHeadings[activeHeadings.length - 1];
      parentEntry[Symbol()] = entry;
      activeHeadings.push(entry);
    }

    // Add a new entry to the list of children under construction.
    const entry = {};
    const parentEntry = activeHeadings[activeHeadings.length - 1];
    parentEntry[heading] = entry;
    activeHeadings.push(entry);
  });

  return pruneEmptyObjects(document) ?? {};
}

// Replace empty objects in the tree with nulls.
function pruneEmptyObjects(tree) {
  const keys = [...Object.keys(tree), ...Object.getOwnPropertySymbols(tree)];
  if (keys.length === 0) {
    return null;
  }
  const result = {};
  for (const key of keys) {
    result[key] = pruneEmptyObjects(tree[key]);
  }
  return result;
}
