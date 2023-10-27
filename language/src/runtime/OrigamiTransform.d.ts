import { Mixin } from "../..";

import type { AsyncTree } from "@graphorigami/types";

// TODO: Figure out how to import declarations from InheritScopeMixin and
// FileLoadersTransform and apply them here.
declare const OrigamiTransform: Mixin<{
  scope: AsyncTree|null;
}>;

export default OrigamiTransform;
