/// <reference path="../core/explorable.ts"/>

declare const InheritScopeTransform: Transform<{
  inheritsScope: boolean;
  isInScope: boolean;
  scope: Explorable;
}>;

export default InheritScopeTransform;
