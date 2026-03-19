import { Mixin } from "../../index.ts";

declare const WatchFilesMixin: Mixin<{
  unwatch(): void;
  watch(): void;
}>;

export default WatchFilesMixin;
