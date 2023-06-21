/// <reference path="../core/explorable.ts"/>

// TODO: Figure out how to import declarations from InheritScopeTransform and
// FileLoadersTransform and apply them here.
declare const FileTreeTransform: Mixin<{
  inheritsScope: boolean;
  parent: Explorable|null;
  scope: Explorable|null;
}>;

export default FileTreeTransform;
