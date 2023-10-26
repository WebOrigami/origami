/**
 * A read-only async dictionary that can represent a node in a tree.
 *
 * Implicit in this interface: a tree often returns values that also trees,
 * typically the same kind of tree, but that is not required.
 */
export default interface AsyncTree {
  get(key: any): Promise<any>;
  isKeyForSubtree?(key: any): Promise<boolean>;
  keys(): Promise<Iterable<any>>;
  parent?: AsyncTree|null;
}
