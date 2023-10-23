import AsyncDictionary from './AsyncDictionary';

/**
 * An async dictionary that represents a node in a tree.
 *
 * Implicit in this interface: a tree often returns values that also trees,
 * typically the same kind of tree, but that is not required.
 */
export default interface AsyncTree extends AsyncDictionary {
  isKeyForSubtree?(key: any): Promise<boolean>;

  // TODO: Rename
  parent: AsyncDictionary|null;

  // TODO: Deprecate
  traverse?(...keys: any[]): Promise<any>;
}