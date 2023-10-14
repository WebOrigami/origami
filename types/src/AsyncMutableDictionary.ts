import AsyncDictionary from "./AsyncDictionary";

/**
 * A read-write asynchronous key-value dictionary
 */
export default interface AsyncMutableDictionary extends AsyncDictionary {
  set(key: any, value: any): Promise<this>;
}
