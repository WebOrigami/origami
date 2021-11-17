import path from "path";
import ExplorableGraph from "../../core/ExplorableGraph.js";

export default function mapTypes(
  variant,
  sourceExtension,
  destinationExtension,
  fn
) {
  const graph = ExplorableGraph.from(variant);
  const sourceExtensionLower = sourceExtension.toLowerCase();
  const destinationExtensionLower = destinationExtension.toLowerCase();
  const environment = this;
  return {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph) {
        const extension = path.extname(key);
        yield extension.toLowerCase() === sourceExtensionLower
          ? `${path.basename(key, extension)}${destinationExtension}`
          : key;
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
        value = value
          ? await fn.call(environment, value, sourceKey, key)
          : undefined;
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
