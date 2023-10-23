import { Mixin } from "../..";

import type { AsyncDictionary } from "@graphorigami/types";

declare const InheritScopeTransform: Mixin<{
  scope: AsyncDictionary|null;
}>;

export default InheritScopeTransform;
