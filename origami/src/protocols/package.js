import { Tree, keysFromPath, scope } from "@weborigami/async-tree";

/**
 * Return the exports of an npm package.
 *
 * @param {string[]} keys
 */
export default async function packageNamespace(...keys) {
  let name = keys.shift();
  let organization;
  if (name?.startsWith("@")) {
    // First key is an npm organization
    organization = name;
    if (keys.length === 0) {
      // Return a function that will process the next key
      return async (name, ...keys) => getPackage(organization, name, keys);
    }
    name = keys.shift();
  }

  return getPackage(organization, name, keys);
}

async function getPackage(organization, name, keys) {
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

  return result;
}
