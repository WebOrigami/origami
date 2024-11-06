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
  } else if (key === undefined) {
    return commandDescriptions(builtins, namespace);
  }
}
help.description = "Help on builtin namespaces and commands";

async function commandDescriptions(builtins, namespace) {
  const withColon = `${namespace}:`;
  const commands = builtins[withColon];
  if (!commands) {
    return `Namespace "${namespace}" not found`;
  }

  const text = [`Commands in the "${namespace}:" namespace:\n`];
  for (const key in commands) {
    const command = commands[key];
    if (command?.description) {
      text.push(`  ${namespace}:${command.description}`);
    }
  }
  text.push(
    `\nFor more information visit https://weborigami.org/builtins/${namespace}`
  );
  return text.join("\n");
}

async function namespaceDescriptions(builtins) {
  const text = [`Available namespaces in Origami ${version}:\n`];
  for (const key in builtins) {
    const builtin = builtins[key];
    const withoutColon = key.replace(/:$/, "");
    if (builtin?.description) {
      text.push(`  ${withoutColon} - ${builtin.description}`);
    }
  }
  text.push(
    `\nType "help:<namespace>" for more information or visit https://weborigami.org/builtins`
  );
  return text.join("\n");
}

function root(tree) {
  let current = tree;
  while (current.parent) {
    current = current.parent;
  }
  return current;
}
