import AsyncTree from "./AsyncTree";

/**
 * A read-write asynchronous key-value tree.
 */
export default interface AsyncMutableTree extends AsyncTree {
  set(key: any, value: any): Promise<this>;
}
