/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { OrigamiFiles } from "@weborigami/language";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import { oriHandler } from "../internal.js";

const configFileName = "config.ori";

/**
 * Return an object for the current project including
 *
 * `config`: the evaluated config.ori file
 * `root`: the project's root folder
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
 */
export default async function project() {
  assertTreeIsDefined(this, "origami:project");

  const dirname = process.cwd();
  const currentTree = new OrigamiFiles(dirname);

  // Search up the tree for the configuration file or package.json to determine
  // the project root.
  let root;
  let config;
  const foundConfig = await findAncestorFile(currentTree, configFileName);
  if (foundConfig) {
    root = foundConfig.container;
    const buffer = foundConfig.value;
    // Unpack Origami configuration file
    config = await oriHandler.unpack(buffer, {
      key: configFileName,
      parent: root,
    });
    if (!config) {
      throw new Error(
        `Couldn't load the Origami configuration in ${root.path}/${configFileName}`
      );
    }
  } else {
    // No Origami configuration file, look for package.json
    config = null;
    const foundPackageJson = await findAncestorFile(
      currentTree,
      "package.json"
    );
    if (foundPackageJson) {
      // Found package.json; use its parent as the project root
      root = foundPackageJson.container;
    } else {
      // No package.json found; use the current directory as root
      root = currentTree;
    }
  }

  return {
    config,
    root,
  };
}

// Find the first ancestor of the given folder that contains a file with the
// given name. Return the container and the file contents.
async function findAncestorFile(start, fileName) {
  let container = start;
  while (container) {
    const value = await container.get(fileName);
    if (value) {
      // Found the desired file
      return {
        container,
        value,
      };
    }
    // Not found; try the parent
    const parent = await container.get("..");
    if (
      !parent ||
      (parent.path && container.path && parent.path === container.path)
    ) {
      break;
    }
    container = parent;
  }

  // Not found
  return null;
}
