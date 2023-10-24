import { Mixin } from "../..";

import type { AsyncDictionary } from "@graphorigami/types";

declare const InheritScopeMixin: Mixin<{
  scope: AsyncDictionary|null;
}>;

export default InheritScopeMixin;
