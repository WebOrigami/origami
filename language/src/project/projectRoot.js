import path from "node:path";
import OrigamiFiles from "../runtime/OrigamiFiles.js";

const configFileName = "config.ori";
const packageFileName = "package.json";

const mapPathToRoot = new Map();

/**
 * Return an OrigamiFiles object for the current project.
 *
 * This searches the current directory and its ancestors for an Origami file
 * called `config.ori`. If an Origami configuration file is found, the
 * containing folder is considered to be the project root.
 *
 * Otherwise, this looks for a package.json file to determine the project root.
 * If no package.json is found, the current folder is used as the project root.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {string} [dirname]
 */
export default async function projectRoot(dirname = process.cwd()) {
  const cached = mapPathToRoot.get(dirname);
  if (cached) {
    return cached;
  }

  let root;
  let value;
  const currentTree = new OrigamiFiles(dirname);
  // Try looking for config file
  value = await currentTree.get(configFileName);
  if (value) {
    // Found config file
    root = currentTree;
  } else {
    // Try looking for package.json
    value = await currentTree.get(packageFileName);
    if (value) {
      // Found package.json
      root = currentTree;
    } else {
      // Move up a folder and try again
      const parentPath = path.dirname(dirname);
      if (parentPath !== dirname) {
        root = await projectRoot(parentPath);
      } else {
        // At filesystem root, use current working directory
        root = new OrigamiFiles(process.cwd());
      }
    }
  }

  mapPathToRoot.set(dirname, root);
  return root;
}
