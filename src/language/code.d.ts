/// <reference path="../core/explorable.ts"/>

type Code = [GraphVariant, ...any[]] | any;

type ExecutionContext = {
  scope?: Explorable;
}