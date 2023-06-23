/// <reference path="../core/explorable.ts"/>

declare const InheritScopeTransform: Mixin<{
  inheritsScope: boolean;
  parent: Explorable|null;
  scope: Explorable|null;
}>;

export default InheritScopeTransform;
