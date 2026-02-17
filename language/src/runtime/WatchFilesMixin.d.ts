import { Mixin } from "../../index.ts";

declare const WatchFilesMixin: Mixin<{
  watch(): Promise<void>;
}>;

export default WatchFilesMixin;
