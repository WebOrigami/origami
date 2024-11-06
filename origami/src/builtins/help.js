import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import version from "../origami/version.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string?} namespace
 * @param {string?} key
 */
export default async function help(namespace, key) {
  assertTreeIsDefined(this, "help:");
  const builtinsTree = root(this);
  const builtins = builtinsTree.object;
  if (namespace === undefined) {
    return namespaceDescriptions(builtins);
  }
}

help.description = "Help on builtin namespaces and commands";

async function namespaceDescriptions(builtins) {
  const text = [`Available namespaces in Origami ${version}:\n`];
  for (const key in builtins) {
    const builtin = builtins[key];
    if (builtin.description) {
      text.push(`  ${key} ${builtin.description}`);
    }
  }
  text.push(`\nUse help:<namespace> for more information.`);
  return text.join("\n");
}

function root(tree) {
  let current = tree;
  while (current.parent) {
    current = current.parent;
  }
  return current;
}
