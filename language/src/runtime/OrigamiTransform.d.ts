import { Mixin } from "../../index.ts";

import type { AsyncTree } from "@weborigami/types";

// TODO: Figure out how to import declarations from InheritScopeMixin and
// FileLoadersTransform and apply them here.
declare const OrigamiTransform: Mixin<{
  scope: AsyncTree|null;
}>;

export default OrigamiTransform;
