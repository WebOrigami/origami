import { Tree, keysFromPath, pathFromKeys } from "@weborigami/async-tree";
import projectRoot from "../project/projectRoot.js";

/**
 * The package: protocol handler
 *
 * @param {any[]} args
 */
export default async function packageProtocol(...args) {
  const state = args.pop(); // Remaining args are the path
  const root = await projectRoot(state);

  // Identify the path to the package root
  const packageRootKeys = ["node_modules"];
  let name = args.shift();
  packageRootKeys.push(name);
  if (name.startsWith("@")) {
    // First key is an npm organization, add next key as name
    const nameArg = args.shift();
    name += nameArg;
    packageRootKeys.push(nameArg);
  }
  const packageRootPath = pathFromKeys(packageRootKeys);

  // Get the package root (top level folder of the package)
  let packageRoot = await Tree.traverse(root, ...packageRootKeys);
  if (!packageRoot) {
    // Can't find package -- are we *in* the package?
    const packageJson = await Tree.traverse(root, "package.json");
    const packageData = await packageJson?.unpack();
    if (packageData?.name === name) {
      // Yes, we're in the package itself
      packageRoot = root;
    } else {
      throw new Error(`Can't find ${packageRootPath}`);
    }
  }

  // Identify the main entry point
  const mainPath = await Tree.traverse(packageRoot, "package.json", "main");
  if (mainPath === undefined) {
    throw new Error(
      `${packageRootPath} doesn't contain a package.json with a "main" entry.`,
    );
  }

  // Identify the folder containing the main entry point
  const mainKeys = keysFromPath(mainPath);
  const mainFileName = mainKeys.pop();
  const mainContainer = await Tree.traverse(packageRoot, ...mainKeys);
  const packageExports = await mainContainer.import(mainFileName);

  let result =
    "default" in packageExports ? packageExports.default : packageExports;

  // If there are remaining args, traverse into the package exports
  if (args.length > 0) {
    result = await Tree.traverse(result, ...args);
  }

  return result;
}
packageProtocol.needsState = true;
