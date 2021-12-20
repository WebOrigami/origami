/// <reference path="../core/explorable.ts"/>

declare const InheritScopeTransform: Mixin<{
  inheritsScope: boolean;
  isInScope: boolean;
  scope: Explorable;
}>;

export default InheritScopeTransform;
