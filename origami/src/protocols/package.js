import { Tree, keysFromPath, scope } from "@weborigami/async-tree";
import project from "../origami/project.js";

/**
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {string[]} keys
 */
export default async function packageNamespace(...keys) {
  const parent = this ?? (await project.call(null));

  let name = keys.shift();
  let organization;
  if (name?.startsWith("@")) {
    // First key is an npm organization
    organization = name;
    if (keys.length === 0) {
      // Return a function that will process the next key
      return async (name, ...keys) =>
        getPackage(parent, organization, name, keys);
    }
    name = keys.shift();
  }

  return getPackage(parent, organization, name, keys);
}

async function getPackage(parent, organization, name, keys) {
  const packagePath = ["node_modules"];
  if (organization) {
    packagePath.push(organization);
  }
  packagePath.push(name);

  const parentScope = scope(parent);
  const packageRoot = await Tree.traverse(
    // @ts-ignore
    parentScope,
    ...packagePath
  );

  if (!packageRoot) {
    throw new Error(`Can't find ${packagePath.join("/")}`);
  }

  const mainPath = await Tree.traverse(packageRoot, "package.json", "main");
  if (!mainPath) {
    throw new Error(
      `node_modules/${keys.join(
        "/"
      )} doesn't contain a package.json with a "main" entry.`
    );
  }

  const mainKeys = keysFromPath(mainPath);
  const mainContainerKeys = mainKeys.slice(0, -1);
  const mainFileName = mainKeys[mainKeys.length - 1];
  const mainContainer = await Tree.traverse(packageRoot, ...mainContainerKeys);
  const packageExports = await mainContainer.import(mainFileName);

  const result =
    keys.length > 0
      ? await Tree.traverse(packageExports, ...keys)
      : packageExports;

  if (Tree.isAsyncTree(result)) {
    result.parent = parent;
  }

  return result;
}
