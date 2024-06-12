/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { OrigamiFiles, Scope } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import builtins from "./@builtins.js";
import fileTypeOrigami from "./ori_handler.js";

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

  // Search up the tree for the configuration file or package.json to determine
  // the project root.
  let rootTree =
    (await findAncestorFile(currentTree, configFileName)) ??
    (await findAncestorFile(currentTree, "package.json"));

  let config = null;
  if (rootTree) {
    // Load the configuration.
    const configParent = Scope.treeWithScope(rootTree, builtins);
    const buffer = await configParent.get(configFileName);
    if (buffer) {
      // Project has configuration file
      config = await fileTypeOrigami.unpack(buffer, {
        key: configFileName,
        parent: configParent,
      });
      if (!config) {
        const configPath = /** @type {any} */ (configParent).path;
        throw new Error(
          `Couldn't load the Origami configuration in ${configPath}/${configFileName}`
        );
      }
    }
  } else {
    rootTree = currentTree;
  }

  // Add the configuration as the context for the project root.
  const scope = new Scope(config, builtins);
  const result = Scope.treeWithScope(rootTree, scope);
  return key === undefined ? result : result.get(key);
}

// Return the first ancestor of the given tree that contains a file with the
// given name.
async function findAncestorFile(start, fileName) {
  let current = start;
  while (current) {
    const value = await current.get(fileName);
    if (value) {
      // Found the desired file; its container is the project root.
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
