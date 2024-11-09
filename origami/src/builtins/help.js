import helpRegistry from "../common/helpRegistry.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import version from "../origami/version.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} [key]
 */
export default async function help(key) {
  assertTreeIsDefined(this, "help:");
  const builtinsTree = root(this);
  const builtins = builtinsTree.object;

  if (key === undefined) {
    // Show all namespace descriptions
    return namespaceDescriptions(builtins);
  }

  // Try treating key as a namespace.
  const namespaceKey = `${key}:`;
  const commands = builtins[namespaceKey];
  if (commands) {
    return namespaceCommands(commands, namespaceKey);
  }

  // Try treating key as a builtin command.
  for (const namespace in builtins) {
    const commands = builtins[namespace];
    const command = commands[key];
    if (command) {
      return commandDescription(namespace, key);
    }
  }

  return `"${key}" not found`;
}

helpRegistry.set("help:", "Get help on builtin namespaces and commands");

async function commandDescription(namespace, key) {
  const description = helpRegistry.get(`${namespace}${key}`);
  if (description) {
    const withoutColon = namespace.replace(/:$/, "");
    const text = [
      "",
      `  ${namespace}${key}${description}`,
      "",
      `For more information: https://weborigami.org/builtins/${withoutColon}/${key}`,
    ];
    return text.join("\n");
  }
  return `No help available for "${namespace}${key}"`;
}

async function namespaceCommands(commands, namespace) {
  const text = [];
  for (const key in commands) {
    const description = helpRegistry.get(`${namespace}${key}`);
    if (description) {
      text.push(`  ${namespace}${key}${description}`);
    }
  }

  if (text.length === 0) {
    text.push(`"${namespace}" works like a URL protocol.`);
  } else {
    text.unshift("");
    text.push("");
    const description = helpRegistry.get(namespace);
    if (description) {
      const lowercase = description[0].toLowerCase() + description.slice(1);
      text.unshift(
        `The "${namespace}" namespace contains commands to ${lowercase}.`
      );
    }
  }

  text.push(
    `For more information: https://weborigami.org/builtins/${namespace}`
  );
  return text.join("\n");
}

async function namespaceDescriptions(builtins) {
  const text = [
    `Origami ${version} has commands grouped into the following namespaces:\n`,
  ];
  for (const key in builtins) {
    if (key.startsWith(":")) {
      // Skip shorthand keys like ":json".
      continue;
    }
    const withoutColon = key.replace(/:$/, "");
    const description = helpRegistry.get(key);
    if (description) {
      text.push(`  ${withoutColon} - ${description}`);
    }
  }
  text.push(
    `\nType "ori help:<namespace>" for more or visit https://weborigami.org/builtins`
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
