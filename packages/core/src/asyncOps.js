import { asyncGet, asyncSet } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";

/**
 * Returns the keys for an async graph.
 *
 * @param {any} graph
 */
export async function keys(graph) {
  const result = [];
  for await (const key of graph) {
    result.push(key);
  }
  return result;
}

/**
 * Create a plain JavaScript object with the graph's keys cast to strings,
 * and the given `mapFn` applied to values.
 *
 * @param {any} graph
 * @param {any} mapFn
 */
export async function mapValues(graph, mapFn) {
  const result = {};
  for await (const key of graph) {
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
 * @param {any} graph
 */
export async function plain(graph) {
  return await mapValues(graph, (/** @type {any} */ value) => value);
}

/**
 * Converts a graph into a plain JavaScript object with the same structure
 * as the original, but with all leaf values cast to strings.
 *
 * @param {any} graph
 */
export async function strings(graph) {
  return await mapValues(graph, async (obj) => String(await obj));
}

/**
 * Converts a graph into a plain JavaScript object with the same structure
 * as the original, but with all leaf values being `null`.
 *
 * The result's keys will be the graph's keys cast to strings. Any graph value
 * that is itself a graph will be similarly converted to its structure.
 *
 * @param {any} graph
 */
export async function structure(graph) {
  return await mapValues(graph, () => null);
}

/**
 * Performs a depth-first traversal of the explorable.
 *
 * Note: This does not check for or prevent cycles.
 *
 * @param {*} graph
 * @param {function} callback
 * @param {any[]} [route]
 */
export async function traverse(graph, callback, route = []) {
  for await (const key of graph) {
    const extendedRoute = [...route, key];
    const value = await graph[asyncGet](key);
    const interior = value instanceof AsyncExplorable;
    callback(extendedRoute, interior, value);
    if (interior) {
      await traverse(value, callback, extendedRoute);
    }
  }
}

export async function update(target, source) {
  await traverse(source, async (route, interior, value) => {
    if (!interior) {
      await target[asyncSet](...route, value);
    }
  });
  return target;
}
