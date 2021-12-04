import path from "path";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import * as utilities from "../../core/utilities.js";

/**
 * @this {Explorable}
 */
export default function mapTypes(
  variant,
  sourceExtension,
  destinationExtension,
  mapFn
) {
  const graph = ExplorableGraph.from(variant);
  const sourceExtensionLower = sourceExtension.toLowerCase();
  const destinationExtensionLower = destinationExtension.toLowerCase();
  const fn = utilities.toFunction(mapFn);
  return {
    async *[Symbol.asyncIterator]() {
      const keys = new Set();
      for await (const key of graph) {
        const extension = path.extname(key);
        const mappedKey =
          extension.toLowerCase() === sourceExtensionLower
            ? `${path.basename(key, extension)}${destinationExtension}`
            : key;
        if (!keys.has(mappedKey)) {
          keys.add(mappedKey);
          yield mappedKey;
        }
      }
    },

    async get(key) {
      const applyMap =
        path.extname(key).toLowerCase() === destinationExtensionLower;
      let value;
      if (applyMap) {
        // Asking for an extension that we map to.
        // Use regular get to get the value to map.
        const basename = path.basename(key, destinationExtension);
        const sourceKey = `${basename}${sourceExtension}`;
        value = await graph.get(sourceKey);
        value = value ? await fn.call(this, value, sourceKey, key) : undefined;
      } else {
        // Not an extension we handle.
        value = await graph.get(key);
      }

      if (value !== undefined && ExplorableGraph.isExplorable(value)) {
        value = mapTypes(value, sourceExtension, destinationExtension, fn);
      }

      return value;
    },
  };
}

mapTypes.usage = `mapTypes(...args)\tMap a graph of files from one file type to another`;
