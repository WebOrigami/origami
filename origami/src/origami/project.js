/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { Tree } from "@weborigami/async-tree";
import { OrigamiFiles } from "@weborigami/language";
import { builtins, oriHandler } from "../builtins/internal.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

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
  assertTreeIsDefined(this, "origami:project");

  const dirname = process.cwd();
  const currentTree = new OrigamiFiles(dirname);
  currentTree.parent = builtins;

  // Search up the tree for the configuration file or package.json to determine
  // the project root.
  const configContainer =
    (await findAncestorFile(currentTree, configFileName)) ??
    (await findAncestorFile(currentTree, "package.json"));

  let projectRoot;
  if (!configContainer) {
    // No configuration file or package.json found; use the current directory.
    projectRoot = currentTree;
  } else {
    // Load the configuration file if one exists.
    const buffer = await configContainer.get(configFileName);
    if (!buffer) {
      // Project root defined by package.json
      projectRoot = configContainer;
    } else {
      // Load Origami configuration file
      const config = await oriHandler.unpack(buffer, {
        key: configFileName,
        parent: configContainer,
      });
      if (!config) {
        const configPath = /** @type {any} */ (configContainer).path;
        throw new Error(
          `Couldn't load the Origami configuration in ${configPath}/${configFileName}`
        );
      }

      // The config tree may refer to the container tree *and vice versa*. To
      // support this, we put the container in the tree twice. The chain will
      // be: projectRoot -> configTree -> configContainer -> builtins, where
      // the projectRoot and configContainer are the same folder.
      const configTree = Tree.from(config);
      projectRoot = new OrigamiFiles(configContainer.path);
      projectRoot.parent = configTree;
      configTree.parent = configContainer;
      configContainer.parent = builtins;
    }
  }

  return key === undefined ? projectRoot : projectRoot.get(key);
}

// Return the first ancestor of the given tree that contains a file with the
// given name.
async function findAncestorFile(start, fileName) {
  let current = start;
  while (current) {
    const value = await current.get(fileName);
    if (value) {
      // Found the desired file; its container is the project root. Set the
      // parent to the builtins; in the context of this project, there's nothing
      // higher up.
      current.parent = builtins;
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
