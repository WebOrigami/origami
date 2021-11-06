import ExplorableGraph from "./ExplorableGraph.js";

/**
 * The GraphProxy base class proxies get/set property calls to the graph if the
 * GraphDelegate subclass (or a further subclass of that) didn't explicitly
 * handle it. This exists to save delegates from having to explicitly forward
 * property get/set calls to the graph.
 *
 * We define the GraphProxy prototype as a Proxy to do this forwarding, a
 * shenanigan that requires us to build the GraphProxy class by hand instead of
 * using class syntax.
 */
function GraphProxy() {}
GraphProxy.prototype = new Proxy(
  {},
  {
    // Forward get calls to the graph.
    get(target, prop, receiver) {
      return receiver.graph[prop];
    },

    // Forward set calls to the graph if the graph already has such a property.
    set(target, prop, value, receiver) {
      // if (Reflect.has(receiver, "graph") && Reflect.has(receiver.graph, prop)) {
      if ("graph" in receiver && prop in receiver.graph) {
        receiver.graph[prop] = value;
      } else {
        Reflect.set(target, prop, value, receiver);
      }
      return true;
    },
  }
);
GraphProxy.prototype.constructor = GraphProxy;

/**
 * A graph that wraps another graph.
 */
export default class GraphDelegate extends GraphProxy {
  #graph;

  constructor(graph) {
    super();
    this.#graph = graph;
  }

  async *[Symbol.asyncIterator]() {
    yield* this.#graph;
  }

  async get(...keys) {
    const value = await this.#graph.get(...keys);
    return ExplorableGraph.isExplorable(value)
      ? Reflect.construct(this.constructor, [value])
      : value;
  }

  get graph() {
    return this.#graph;
  }

  async set(...args) {
    return this.#graph.set(...args);
  }
}
