/**
 * A read-write asynchronous key-value dictionary.
 */
export default interface AsyncMutable {
  set(key: any, value: any): Promise<this>;
}
