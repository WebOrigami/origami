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
        const extension = path.extname(key).toLowerCase();
        yield extension === sourceExtensionLower
          ? `${path.basename(key, extension)}${destinationExtension}`
          : key;
      }
    },

    async get(...keys) {
      let lastKey = keys.pop();
      if (
        lastKey &&
        path.extname(lastKey).toLowerCase() === destinationExtensionLower
      ) {
        // Asking for an extension that we map to.
        // Try all the source extensions.
        const basename = path.basename(lastKey, destinationExtension);
        const key = `${basename}${sourceExtension}`;
        const value = await graph.get(...keys, key);
        return value !== undefined
          ? await fn.call(environment, value /* keys */)
          : ExplorableGraph.isExplorable(value)
          ? mapTypes(value, sourceExtension, destinationExtension, fn)
          : value;
      } else {
        // Not an extension we handle.
        return await graph.get(...keys, lastKey);
      }
    },
  };
}

mapTypes.usage = `mapTypes(...args)\tMap a graph of files from one file type to another`;
