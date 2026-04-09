import { Mixin } from "../../index.ts";

declare const CacheTransform: Mixin<{}>

export const cache: Map<string, { value: any; downstreams?: Set<string> }>;

export default CacheTransform;
