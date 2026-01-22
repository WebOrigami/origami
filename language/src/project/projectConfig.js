import { toString, Tree } from "@weborigami/async-tree";
import ori_handler from "../handlers/ori_handler.js";
import coreGlobals from "./coreGlobals.js";

/**
 * Given a container, return the Origami configuration for the associated
 * project root. This will be the unpacked config.ori file if it exists, or an
 * empty object otherwise.
 *
 * @typedef {import("@weborigami/async-tree").SyncOrAsyncMap} SyncOrAsyncMap
 * @param {SyncOrAsyncMap} parent
 */
export default async function config(parent) {
  const projectRoot = await Tree.root(parent);

  let configObject = {};
  const configBuffer = await projectRoot.get("config.ori");
  if (configBuffer) {
    const configText = toString(configBuffer);
    if (configText) {
      // Config uses only core globals (we're defining the config)
      const globals = await coreGlobals();
      // Evaluate the config file to obtain the configuration object
      configObject = await ori_handler.unpack(configText, {
        globals,
        parent: projectRoot,
      });
    }
  }

  return configObject;
}
