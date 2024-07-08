import { Mixin } from "../../index.ts";

import type { AsyncTree } from "@weborigami/types";

declare const OrigamiTransform: Mixin<{
  scope: AsyncTree|null;
}>;

export default OrigamiTransform;
