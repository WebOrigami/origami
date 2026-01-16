import { FileMap } from "@weborigami/async-tree";
import path from "node:path";
import OrigamiFileMap from "../runtime/OrigamiFileMap.js";

const configFileName = "config.ori";
const packageFileName = "package.json";

const mapPathToRoot = new Map();

/**
 * Return an OrigamiFileMap object for the current project root.
 *
 * This searches the current directory and its ancestors for an Origami file
 * called `config.ori`. If an Origami configuration file is found, the
 * containing folder is considered to be the project root.
 *
 * Otherwise, this looks for a package.json file to determine the project root.
 * If no package.json is found, the current folder is used as the project root.
 *
 *
 * @param {string} [dirname]
 */
export default async function projectRootFromPath(dirname = process.cwd()) {
  const cached = mapPathToRoot.get(dirname);
  if (cached) {
    return cached;
  }

  let root;
  let value;
  // Use a plain FileMap to avoid loading extension handlers
  let currentFolder = new FileMap(dirname);
  while (currentFolder) {
    // Try looking for config file
    value = await currentFolder.get(configFileName);
    if (value) {
      // Found config file
      root = new OrigamiFileMap(currentFolder.path);
      break;
    }

    // Try looking for package.json
    value = await currentFolder.get(packageFileName);
    if (value) {
      // Found package.json
      root = new OrigamiFileMap(currentFolder.path);
      break;
    }

    // Move up a folder and try again
    const parentPath = path.dirname(currentFolder.path);
    if (parentPath !== currentFolder.path) {
      currentFolder = new FileMap(parentPath);
    } else {
      // At filesystem root; not found
      root = null;
      break;
    }
  }

  if (!root) {
    // Default to using the provided folder as the project root
    root = new OrigamiFileMap(dirname);
  }

  mapPathToRoot.set(dirname, root);
  return root;
}
