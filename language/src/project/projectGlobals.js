import { Tree } from "@weborigami/async-tree";
import assignPropertyDescriptors from "../runtime/assignPropertyDescriptors.js";
import coreGlobals from "./coreGlobals.js";
import projectConfig from "./projectConfig.js";

/**
 * Return the complete set of globals available to code running in the given
 * container. This will be the core globals plus any configuration specified in
 * the project's config.ori file.
 *
 * This destructively caches a `globals` property on the root of the given
 * container.
 *
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 * @param {SyncOrAsyncMap|null} parent
 */
export default async function projectGlobals(parent) {
  if (!parent) {
    return coreGlobals();
  }

  const projectRoot = await Tree.root(parent);
  if (!projectRoot.globals) {
    // Start with core globals
    const globals = await coreGlobals();

    if (parent) {
      // Get config for the given container and add it to the globals. During
      // this read, we want to only rely on core globals to avoid circularities,
      // so we temporarily set globals to coreGlobals.
      projectRoot.globals = globals;
      const config = await projectConfig(parent);

      // Merge config into globals; don't invoke property getters.
      assignPropertyDescriptors(globals, config);
    }

    // Cache globals on project root
    projectRoot.globals = globals;
  }

  return projectRoot.globals;
}
