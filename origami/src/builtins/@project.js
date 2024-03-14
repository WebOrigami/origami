/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { OrigamiFiles, Scope } from "@weborigami/language";
import fileTypeOrigami from "../builtins/@loaders/ori.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import builtins from "./@builtins.js";

const configFileName = "config.ori";

/**
 * Return the tree for the current project's root folder.
 *
 * This searches the current directory and its ancestors for an Origami file
 * called `config.ori`. If an Origami configuration file is found, the
 * containing folder is considered to be the project root. This returns a tree
 * for that folder, with the exported configuration as the context for that
 * folder — that is, the tree exported by the configuration will be the scope.
 *
 * If no Origami configuration file is found, the current folder will be
 * returned as a tree, with the builtins as its parent.
 *
 * @this {AsyncTree|null}
 * @param {any} [key]
 */
export default async function project(key) {
  assertScopeIsDefined(this, "project");

  const dirname = process.cwd();
  const currentTree = new OrigamiFiles(dirname);
  let projectTree = await findConfigContainer(currentTree);

  let scope;
  if (projectTree) {
    // Load the configuration.
    const buffer = await projectTree.get(configFileName);
    const config = await fileTypeOrigami.unpack(buffer, {
      key: configFileName,
      parent: projectTree,
    });
    if (!config) {
      throw new Error(
        `Couldn't load the Origami configuration in ${projectTree.path}`
      );
    }
    scope = new Scope(config, builtins);
  } else {
    projectTree = currentTree;
    scope = builtins;
  }

  // Add the configuration as the context for the project root.
  const result = Scope.treeWithScope(projectTree, scope);
  return key === undefined ? result : result.get(key);
}

async function findConfigContainer(start) {
  let current = start;
  while (current) {
    const config = await current.get(configFileName);
    if (config) {
      // Found a configuration; its container is the project root.
      return current;
    }
    // Not found; try the parent.
    const parent = await current.get("..");
    if (
      !parent ||
      (parent.path && current.path && parent.path === current.path)
    ) {
      break;
    }
    current = parent;
  }
  return undefined;
}

project.usage = `@project\tThe root of the current Origami project`;
project.documentation = "https://weborigami.org/language/@project.html";
