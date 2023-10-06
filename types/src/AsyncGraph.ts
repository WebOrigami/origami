import AsyncDictionary from './AsyncDictionary';

/**
 * An async dictionary that represents a node in a graph.
 */
export default interface AsyncGraph extends AsyncDictionary {
  isKeyForSubgraph?(key: any): Promise<boolean>;
  traverse?(...keys: any[]): Promise<any>;
}