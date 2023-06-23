import AsyncDictionary from "./AsyncDictionary";
import AsyncMutable from "./AsyncMutable";

/**
 * A read-write asynchronous key-value dictionary.
 */
export default interface AsyncMutableDictionary extends AsyncDictionary, AsyncMutable {}
