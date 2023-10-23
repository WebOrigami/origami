import { Mixin } from "../..";

import type { AsyncDictionary } from "@graphorigami/types";

// TODO: Figure out how to import declarations from InheritScopeTransform and
// FileLoadersTransform and apply them here.
declare const OrigamiTransform: Mixin<{
  scope: AsyncDictionary|null;
}>;

export default OrigamiTransform;
