import { Mixin } from "../../index.ts";

declare const WatchFilesMixin: Mixin<{
  unwatch(): Promise<void>;
  watch(): Promise<void>;
}>;

export default WatchFilesMixin;
