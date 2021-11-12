import path from "path";
import ExplorableGraph from "../../core/ExplorableGraph.js";

export default function mapTypes(graph, sourceExtname, destinationExtName, fn) {
  const environment = this;
  return {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph) {
        yield path.extname(key) === sourceExtname
          ? `${path.basename(key, sourceExtname)}${destinationExtName}`
          : key;
      }
    },

    async get(...keys) {
      let transform = false;
      const lastKeyIndex = keys.length - 1;
      let lastKey = keys[lastKeyIndex];
      if (lastKey && path.extname(lastKey) === destinationExtName) {
        keys[lastKeyIndex] = `${path.basename(
          lastKey,
          destinationExtName
        )}${sourceExtname}`;
        transform = true;
      }

      const value = await graph.get(...keys);

      return transform && value !== undefined
        ? await fn.call(environment, value, keys)
        : ExplorableGraph.isExplorable(value)
        ? mapTypes(value, sourceExtname, destinationExtName, fn)
        : value;
    },
  };
}

mapTypes.usage = `mapTypes(...args)\tMap a graph of files from one file type to another`;
