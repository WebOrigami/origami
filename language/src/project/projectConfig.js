import { FileMap, toString } from "@weborigami/async-tree";
import ori_handler from "../handlers/ori_handler.js";
import coreGlobals from "./coreGlobals.js";
import projectRootFromPath from "./projectRootFromPath.js";

const mapPathToConfig = new Map();

/**
 * Given a folder path, return the Origami configuration for the associated
 * project root. This will be the unpacked config.ori file if it exists, or an
 * empty object otherwise.
 *
 * @param {string} dirname
 */
export default async function config(dirname) {
  const root = await projectRootFromPath(dirname);

  const rootPath = root.path;
  const cached = mapPathToConfig.get(rootPath);
  if (cached) {
    return cached;
  }

  // Use a plain FileMap to avoid loading extension handlers
  const rootFileMap = new FileMap(rootPath);
  const configBuffer = await rootFileMap.get("config.ori");
  let configObject = {};
  if (configBuffer) {
    const configText = toString(configBuffer);
    if (configText) {
      // Config uses only core globals (we're defining the config)
      const globals = await coreGlobals();
      // Evaluate the config file to obtain the configuration object
      configObject = await ori_handler.unpack(configText, {
        globals,
        parent: root,
      });
    }
  }

  mapPathToConfig.set(rootPath, configObject);
  return configObject;
}
