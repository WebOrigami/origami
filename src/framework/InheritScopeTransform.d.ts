/// <reference path="../core/explorable.ts"/>

declare const InheritScopeTransform: Mixin<{
  inheritsScope: boolean;
  isInScope: boolean;
  parent: Explorable;
  scope: Explorable;
}>;

export default InheritScopeTransform;
