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
      if (mapKeyIndex >= 0) {
        // Asking for an extension that we map to.

        // Use regular get to get the value to map.
        const valuePath = keys.slice(0, mapKeyIndex - 2);
        const basename = path.basename(keys[mapKeyIndex], destinationExtension);
        const key = `${basename}${sourceExtension}`;
        valuePath.push(key);
        let value = await graph.get(...valuePath);
        if (value === undefined) {
          return undefined;
        } else if (ExplorableGraph.isExplorable(value)) {
          value = mapTypes(value, sourceExtension, destinationExtension, fn);
        } else {
          value = await fn.call(environment, value);
        }
        const rest = keys.slice(mapKeyIndex + 1);
        if (rest.length === 0) {
          return value;
        } else if (ExplorableGraph.canCastToExplorable(value)) {
          value = ExplorableGraph.from(value);
          return await value.get(...rest);
        } else {
          return undefined;
        }
      } else {
        // Not an extension we handle.
        return await graph.get(...keys);
      }
    },
  };
}

mapTypes.usage = `mapTypes(...args)\tMap a graph of files from one file type to another`;
