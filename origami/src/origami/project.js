/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { OrigamiFiles } from "@weborigami/language";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import { oriHandler } from "../internal.js";

// Separate from above imports to avoid circular dependency
import { Tree } from "@weborigami/async-tree";
import handlers from "../handlers/handlers.js";

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
  const foundConfig = await findAncestorFile(currentTree, configFileName);
  if (foundConfig) {
    root = foundConfig.container;
    // Unpack Origami configuration file
    const buffer = foundConfig.value;
    root.config = await oriHandler.unpack(buffer, {
      key: configFileName,
      parent: root,
    });
  } else {
    // No Origami configuration file, look for package.json
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

  root.handlers = Tree.from(handlers);

  return root;
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
