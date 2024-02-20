import { Tree } from "@weborigami/async-tree";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 */
export default async function table(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike);
  const firstValue = await valueForFirstKey(tree);
  if (Tree.isAsyncTree(firstValue)) {
    return fullTable(tree, firstValue);
  } else {
    return simpleTable(tree);
  }
}

// Tree's values are subtrees.
//
// Return an R x C table, where R is the number of top-level keys in the tree
// (plus a header row), and C is the number of 2nd-level keys (plus a labeling
// column).
//
// The 2nd-level keys are obtain by inspecting the given model object, which is
// taken to represent top-level objects in the tree.
async function fullTable(tree, model) {
  // Construct the header.
  const modelKeys = Array.from(await model.keys());
  const header = " \t" + modelKeys.join("\t");
  const rows = [header];

  // Add a row for each top-level object.
  for (const key of await tree.keys()) {
    let row = key;
    const value = await tree.get(key);
    for (const modelKey of await model.keys()) {
      const value2 = await value.get(modelKey);
      row += `\t${value2}`;
    }
    rows.push(row);
  }

  return rows.join("\n");
}

// Tree's values are not subtrees.
// Return the (key, value) pairs as a simple two-column table.
async function simpleTable(tree) {
  const header = `Key\tValue`;
  const rows = [header];
  for (const key of await tree.keys()) {
    const value = await tree.get(key);
    rows.push(`${key}\t${value}`);
  }
  const text = rows.join("\n");
  return text;
}

// Return the value for the tree's first key.
async function valueForFirstKey(tree) {
  const [value] = await tree.keys();
  return value;
}

table.usage =
  "@table <tree>\tFormat the tree's top level as a tab-delimited table";
table.documentation = "https://weborigami.org/cli/builtins.html#table";
