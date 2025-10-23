/**
 * A read-only async dictionary that can represent a node in a tree.
 *
 * Implicit in this interface: a tree often returns values that are also trees,
 * typically the same kind of tree, but that is not required.
 */
export default interface AsyncTree {
  get(key: any): Promise<any>;
  keys(): Iterator<any> | Promise<Iterable<any>> | AsyncIterable<any>;
  parent?: AsyncTree|null;
}
