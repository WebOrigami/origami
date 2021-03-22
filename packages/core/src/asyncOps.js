import { asyncGet, asyncKeys, asyncSet } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";

/**
 * @typedef {import('@explorablegraph/symbols').IAsyncExplorable} IAsyncExplorable
 */

/**
 * Returns the keys for an async graph.
 *
 * @param {IAsyncExplorable} graph
 */
export async function keys(graph) {
  const result = [];
  for await (const key of graph[asyncKeys]()) {
    result.push(key);
  }
  return result;
}

/**
 * Create a plain JavaScript object with the graph's keys cast to strings,
 * and the given `mapFn` applied to values.
 *
 * @param {IAsyncExplorable} graph
 * @param {any} mapFn
 */
export async function mapValues(graph, mapFn) {
  const result = {};
  for await (const key of graph[asyncKeys]()) {
    const value = await graph[asyncGet](key);
    // TODO: Check that value is of same constructor before traversing into it.
    result[String(key)] =
      value instanceof AsyncExplorable
        ? // value is also explorable; traverse into it.
          await mapValues(value, mapFn)
        : await mapFn(value);
  }
  return result;
}

/**
 * Converts a graph into a plain JavaScript object.
 *
 * The result's keys will be the graph's keys cast to strings. Any graph value
 * that is itself a graph will be similarly converted to a plain object.
 *
 * @param {IAsyncExplorable} graph
 */
export async function plain(graph) {
  return await mapValues(graph, (value) => value);
}

/**
 * Converts a graph into a plain JavaScript object with the same structure
 * as the original, but with all leaf values cast to strings.
 *
 * @param {IAsyncExplorable} graph
 */
export async function strings(graph) {
  return await mapValues(graph, async (value) => {
    const obj = await value;
    // If obj is a primitive type, we won't be able to call toString
    return obj.toString ? obj.toString() : "";
  });
}

/**
 * Converts a graph into a plain JavaScript object with the same structure
 * as the original, but with all leaf values being `null`.
 *
 * The result's keys will be the graph's keys cast to strings. Any graph value
 * that is itself a graph will be similarly converted to its structure.
 *
 * @param {IAsyncExplorable} graph
 */
export async function structure(graph) {
  return await mapValues(graph, () => null);
}

/**
 * Performs a depth-first traversal of the explorable.
 *
 * Note: This does not check for or prevent cycles.
 *
 * @param {IAsyncExplorable} graph
 * @param {function} callback
 * @param {any[]} [route]
 */
export async function traverse(graph, callback, route = []) {
  for await (const key of graph[asyncKeys]()) {
    const extendedRoute = [...route, key];
    const value = await graph[asyncGet](key);
    const interior = value instanceof AsyncExplorable;
    callback(extendedRoute, interior, value);
    if (interior) {
      await traverse(value, callback, extendedRoute);
    }
  }
}

/**
 * Get the values from the source and set them on the target.
 * Returns the target.
 *
 * @param {IAsyncExplorable} target
 * @param {IAsyncExplorable} source
 * @returns IAsyncExplorable
 */
export async function update(target, source) {
  await traverse(source, async (route, interior, value) => {
    if (!interior) {
      await target[asyncSet](...route, value);
    }
  });
  return target;
}
