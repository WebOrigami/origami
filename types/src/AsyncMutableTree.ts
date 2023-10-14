import AsyncMutableDictionary from "./AsyncMutableDictionary";
import AsyncTree from "./AsyncTree";

/**
 * A read-write asynchronous key-value tree.
 */
export default interface AsyncMutableTree extends AsyncTree, AsyncMutableDictionary {}
