/// <reference path="../core/explorable.ts"/>

type ProgramContext = {
  graph: Explorable;
  thisKey?: string;
};

type Code = [GraphVariant, ...any[]] | any;