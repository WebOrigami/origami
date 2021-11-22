/// <reference path="../core/explorable.ts"/>

declare const InheritScopeMixin: Mixin<{
  inheritsScope: boolean;
  isInScope: boolean;
  scope: Explorable;
}>;

export default InheritScopeMixin;
