/// <reference path="../core/shared.d.ts"/>

declare const VirtualValuesMixin: Mixin<{
  importModule(modulePath: string): Promise<any>
}>;

export default VirtualValuesMixin;
