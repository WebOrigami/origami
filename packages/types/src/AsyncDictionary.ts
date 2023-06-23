/**
 * A read-only asynchronous key-value dictionary
 */
export default interface AsyncDictionary {
  get(key: any): Promise<any>;
  keys(): Promise<Iterable<any>>;
}
