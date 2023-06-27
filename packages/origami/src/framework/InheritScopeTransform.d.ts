import { Mixin } from "../core/types";

import type { AsyncDictionary } from "@graphorigami/types";

declare const InheritScopeTransform: Mixin<{
  inheritsScope: boolean;
  parent: AsyncDictionary|null;
  scope: AsyncDictionary|null;
}>;

export default InheritScopeTransform;
