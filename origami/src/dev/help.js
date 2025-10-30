import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";
import YAML from "yaml";
import version from "./version.js";

/**
 *
 * @param {string} [key]
 */
export default async function help(key) {
  const helpFilename = path.resolve(
    fileURLToPath(import.meta.url),
    "../help.yaml"
  );
  const helpYaml = await fs.readFile(helpFilename);
  const helpData = YAML.parse(String(helpYaml));

  if (key === undefined) {
    // Show all namespace descriptions
    return namespaceDescriptions(helpData);
  }

  // Try treating key as a namespace.
  const namespace = helpData[key];
  if (namespace) {
    return namespaceCommands(namespace, key);
  }

  // Try treating key as a builtin command.
  for (const [namespace, { commands }] of Object.entries(helpData)) {
    if (commands && Object.hasOwn(commands, key)) {
      return commandDescription(commands[key], namespace, key);
    }
  }

  return `help: "${key}" not found`;
}

async function commandDescription(commandHelp, namespace, command) {
  const url = commandHelp.collection
    ? `${namespace}.html`
    : `${namespace}/${command}.html`;
  const text = [
    "",
    formatCommandDescription(commandHelp, namespace, command),
    "",
    `For more information: https://weborigami.org/builtins/${url}\n`,
  ];
  return text.join("\n");
}

function formatCommandDescription(commandHelp, namespace, command) {
  const { args, description } = commandHelp;
  return `  ${namespace}.${command}${args ?? ""} - ${description}`;
}

async function namespaceCommands(namespaceHelp, namespace) {
  const text = [];

  const commands = namespaceHelp.commands;
  if (commands === undefined) {
    text.push(`"${namespace}" works like a protocol at the start of a path.`);
  } else {
    if (namespaceHelp.description) {
      const description = namespaceHelp.description;
      const lowercase = description[0].toLowerCase() + description.slice(1);
      text.push(
        `The ${namespace} namespace contains commands to ${lowercase}.`
      );
    }
    text.push("");
    for (const [command, commandHelp] of Object.entries(commands)) {
      text.push(formatCommandDescription(commandHelp, namespace, command));
    }
    text.push("");
  }

  const url = namespaceHelp.collection ? `${namespace}.html` : `${namespace}/`;
  text.push(`For more information: https://weborigami.org/builtins/${url}\n`);
  return text.join("\n");
}

async function namespaceDescriptions(helpData) {
  const text = [
    `Origami ${version} has commands grouped into the following namespaces:\n`,
  ];
  for (const [key, value] of Object.entries(helpData)) {
    const description = value.description;
    if (description) {
      text.push(`  ${key}: ${description}`);
    }
  }
  text.push(
    `\nType "ori help/<namespace>" for more or visit https://weborigami.org/builtins\n`
  );
  return text.join("\n");
}
