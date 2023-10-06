import AsyncGraph from "./AsyncGraph";
import AsyncMutable from "./AsyncMutable";

/**
 * A read-write asynchronous key-value graph.
 */
export default interface AsyncMutableGraph extends AsyncGraph, AsyncMutable {}
