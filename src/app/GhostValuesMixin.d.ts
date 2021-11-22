/// <reference path="../core/explorable.ts"/>

declare const GhostValuesMixin: Mixin<{
  ghostGraphs: Explorable[];
}>;

export const ghostGraphExtension: string;

export default GhostValuesMixin;
