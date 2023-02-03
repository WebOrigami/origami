import map from "./map.js";

/**
 * Map the deep values of a graph with a map function.
 *
 * This is a shorthand for invoking map() with the `deep` option set to true.
 *
 * @this {Explorable}
 */
export default function mapDeep(variant, mapFn, options = {}) {
  Object.assign(options, { deep: true });
  return map(variant, mapFn, options);
}

mapDeep.usage = `mapDeep <graph>, <mapFn>\tMap the deep values in a graph using a map function.`;
mapDeep.documentation = "https://graphorigami.org/cli/builtins.html#mapDeep";
