/// <reference path="../core/explorable.ts"/>

import type { AsyncDictionary } from "@graphorigami/types";

// TODO: Figure out how to import declarations from InheritScopeTransform and
// FileLoadersTransform and apply them here.
declare const FileTreeTransform: Mixin<{
  inheritsScope: boolean;
  parent: AsyncDictionary|null;
  scope: AsyncDictionary|null;
}>;

export default FileTreeTransform;
