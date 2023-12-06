import { Mixin } from "../../index.ts";

import type { AsyncTree } from "@weborigami/types";

declare const InheritScopeMixin: Mixin<{
  scope: AsyncTree|null;
}>;

export default InheritScopeMixin;
