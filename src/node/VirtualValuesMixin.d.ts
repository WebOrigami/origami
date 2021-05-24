/// <reference path="../core/explorable.ts"/>

declare const VirtualValuesMixin: Mixin<{
  importModule(modulePath: string): Promise<any>
}>;

export default VirtualValuesMixin;
