import { Dictionary, Graph } from "@graphorigami/core";
import index from "../builtins/@index.js";
import {
  getScope,
  isTransformApplied,
  transformObject,
} from "../common/utilities.js";
import defaultKeysJson from "../framework/defaultKeysJson.js";

/**
 * Wraps a graph (typically a SiteGraph) to turn a standard site into an
 * explorable site.
 *
 * An explorable site follows three conventions:
 * 1. if route /foo has any resources beneath it (/foo/bar.jpg), then /foo
 *    redirects to /foo/
 * 2. /foo/ is a synonym for foo/index.html
 * 3. /foo/.keys.json returns the public keys below foo/
 *
 * The first convention is handled by the Graph Origami server. This transform
 * handles the second and third conventions.
 *
 * As a convenience, this transform also provides a default index.html page if
 * the graph doesn't define one.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").Constructor<AsyncDictionary>} AsyncDictionaryConstructor
 * @param {AsyncDictionaryConstructor} Base
 */
export default function ExplorableSiteTransform(Base) {
  return class ExplorableSite extends Base {
    async get(key) {
      // The default value of an explorable site is index.html.
      if (key === Graph.defaultValueKey) {
        key = "index.html";
      }

      // Ask the graph if it has the key.
      let value = await super.get(key);

      if (value === undefined) {
        // The graph doesn't have the key; try the defaults.
        const scope = getScope(this);
        if (key === "index.html") {
          value = await index.call(scope, this);
        } else if (key === ".keys.json") {
          value = await defaultKeysJson.call(scope, this);
        }
      }

      // Ensure this transform is applied to any explorable result. This lets
      // the user browse into data and explorable graphs of types other than the
      // current class.
      if (
        Dictionary.isAsyncDictionary(value) &&
        !isTransformApplied(ExplorableSiteTransform, value)
      ) {
        value = transformObject(ExplorableSiteTransform, value);
      }

      if (value?.unpack) {
        // If the value isn't a graph, but has a graph attached via a `unpack`
        // method, wrap the unpack method to add this transform.
        const original = value.unpack.bind(value);
        value.unpack = async () => {
          const content = await original();
          if (!Graph.isGraphable(content)) {
            return content;
          }
          /** @type {any} */
          let graph = Graph.from(content);
          if (!isTransformApplied(ExplorableSiteTransform, graph)) {
            graph = transformObject(ExplorableSiteTransform, graph);
          }
          return graph;
        };
      }
      return value;
    }
  };
}
