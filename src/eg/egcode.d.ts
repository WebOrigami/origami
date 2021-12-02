/// <reference path="../core/explorable.ts"/>

type ProgramContext = {
  bindings?: PlainObject;
  graph: Explorable;
  thisKey?: string;
};

type Code = [GraphVariant, ...any[]] | any;