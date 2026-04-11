import { Mixin } from "../../index.ts";

declare const HandleExtensionsTransform: Mixin<{
  initializeGlobals(): Promise<void>;
}>;

export default HandleExtensionsTransform;
