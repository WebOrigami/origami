import helpRegistry from "../common/helpRegistry.js";
import project from "./project.js";

/**
 * Return the configuration for the current project.
 *
 * The configuration is the project's config.ori file (if defined in the project
 * root) plus the Origami builtins.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any} [key]
 */
export default async function config(key) {
  const projectTree = await project.call(this);
  // HACK: We use specific knowledge of how @project returns a tree to get the
  // config. The config is always the parent of the project folder.
  const parent = projectTree.parent;
  return key === undefined ? parent : parent.get(key);
}

helpRegistry.set("origami:config", " - The current project's configuration");
