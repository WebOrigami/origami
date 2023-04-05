import index from "../builtins/@index.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { getScope } from "../core/utilities.js";

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
 * @param {Constructor<Explorable>} Base
 */
export default function ExplorableSiteTransform(Base) {
  return class ExplorableSite extends Base {
    // async get(key) {
    //   // An `undefined` key occurs, e.g., when a user tries to browse to a path
    //   // with a trailing slash, like foo/. This is equivalent to requesting
    //   // foo/index.html.
    //   if (key === undefined) {
    //     key = "index.html";
    //   }

    //   // Ask the graph if it has the key.
    //   let value = await super.get(key);

    //   if (value === undefined) {
    //     // The graph doesn't have the key; try the defaults.
    //     const scope = getScope(this);
    //     if (key === "index.html") {
    //       value = await index.call(scope, this);
    //     } else if (key === ".keys.json") {
    //       value = await defaultKeysJson.call(scope, this);
    //     }
    //   }

    //   // Ensure this transform is applied to any explorable result. This lets
    //   // the user browse into data and explorable graphs of types other than the
    //   // current class.
    //   if (
    //     ExplorableGraph.isExplorable(value) &&
    //     !isTransformApplied(ExplorableSiteTransform, value)
    //   ) {
    //     value = transformObject(ExplorableSiteTransform, value);
    //   }

    //   if (value?.toGraph) {
    //     // If the value isn't a graph, but has a graph attached via a `toGraph`
    //     // method, wrap the toGraph method to add this transform.
    //     const original = value.toGraph.bind(value);
    //     value.toGraph = () => {
    //       let graph = original();
    //       if (!isTransformApplied(ExplorableSiteTransform, graph)) {
    //         graph = transformObject(ExplorableSiteTransform, graph);
    //       }
    //       return graph;
    //     };
    //   }
    //   return value;
    // }

    async get(key) {
      return this.traverse(key);
    }

    async traverse(...keys) {
      if (keys.at(-1) === undefined) {
        keys.pop();
      }
      // let value;
      // if (super.traverse) {
      //   value = await super.traverse?.(...keys);
      // } else {
      //   const [key, ...rest] = keys;
      //   value = await super.get(key);
      //   if (rest.length) {
      //     value = await ExplorableGraph.traverse(value, ...rest);
      //   }
      // }
      const proto = Object.getPrototypeOf(this);
      let value = await ExplorableGraph.traverse(proto, ...keys);
      if (ExplorableGraph.isExplorable(value)) {
        // The value is explorable; return an index page for it.
        // TODO: if the key ends in .json or .yaml, render the graph as JSON or
        // YAML instead. Reconcile this with the existing feature in the server.
        const scope = getScope(this);
        value = await index.call(scope, value);
      }
      return value;
    }
  };
}
