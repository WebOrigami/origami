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
  const projectConfig = projectTree.config;
  return key === undefined ? projectConfig : projectConfig.get(key);
}
