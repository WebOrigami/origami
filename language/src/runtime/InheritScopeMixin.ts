import { Mixin } from "../..";

import type { AsyncTree } from "@graphorigami/types";

declare const InheritScopeMixin: Mixin<{
  scope: AsyncTree|null;
}>;

export default InheritScopeMixin;
