import { Scope } from "@weborigami/language";
import project from "./@project.js";

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
  // config. We get the scope of the project's root folder, then remove that
  // folder from the scope, leaving config + builtins.
  /** @type {any} */
  const projectTreeScope = Scope.getScope(projectTree);
  const trees = projectTreeScope?.trees;
  if (!trees) {
    return undefined;
  }
  trees.shift();
  const scope = new Scope(...trees);
  return key === undefined ? scope : scope.get(key);
}

config.usage = `@config\tThe current project's configuration tree`;
config.documentation = "https://weborigami.org/language/@config.html";
