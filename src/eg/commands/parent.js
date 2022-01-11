/**
 * Returns the parent of the current graph.
 *
 * @this {Explorable}
 */
export default async function parent() {
  return /** @type {any} */ (this).parent;
}

parent.usage = `parent()\Returns the parent of the current graph`;
