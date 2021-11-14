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

    async get(...keys) {
      const mapKeyIndex = keys.findIndex(
        (key) => path.extname(key).toLowerCase() === destinationExtensionLower
      );
      let value;
      if (mapKeyIndex >= 0) {
        // Asking for an extension that we map to.
        // Use regular get to get the value to map.
        const sourcePath = mapKeyIndex > 0 ? keys.slice(0, mapKeyIndex) : [];
        const destinationKey = keys[mapKeyIndex];
        const basename = path.basename(destinationKey, destinationExtension);
        const sourceKey = `${basename}${sourceExtension}`;
        sourcePath.push(sourceKey);
        const rest = keys.slice(mapKeyIndex + 1);
        value = await graph.get(...sourcePath);
        value = value
          ? await fn.call(environment, value, sourceKey, destinationKey)
          : undefined;
        if (value !== undefined && rest.length > 0) {
          if (ExplorableGraph.canCastToExplorable(value)) {
            value = ExplorableGraph.from(value);
            value = await value.get(...rest);
          } else {
            value = undefined;
          }
        }
      } else {
        // Not an extension we handle.
        value = await graph.get(...keys);
        if (ExplorableGraph.isExplorable(value)) {
          value = mapTypes(value, sourceExtension, destinationExtension, fn);
        }
      }

      return value;
    },
  };
}

mapTypes.usage = `mapTypes(...args)\tMap a graph of files from one file type to another`;
