import { extension, trailingSlash } from "@weborigami/async-tree";

// Return a function that adds the given extension
export default function addExtensionKeyFn(resultExtension) {
  const keyFn = (sourceValue, sourceKey) => {
    if (sourceKey === undefined) {
      return undefined;
    }
    const normalizedKey = trailingSlash.remove(sourceKey);
    const sourceExtension = extension.extname(normalizedKey);
    const resultKey = sourceExtension
      ? extension.replace(normalizedKey, sourceExtension, resultExtension)
      : normalizedKey + resultExtension;
    return resultKey;
  };
  keyFn.needsSourceValue = false;
  return keyFn;
}
