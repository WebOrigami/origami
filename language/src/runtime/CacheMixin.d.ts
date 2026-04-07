import { Mixin } from "../../index.ts";

declare const CacheMixin: Mixin<{}>

export const cache: Map<string, { value: any; downstreams?: Set<string> }>;

export default CacheMixin;
