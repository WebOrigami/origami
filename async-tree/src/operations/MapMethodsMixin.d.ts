export type Constructor<T> = new (...args: any[]) => T;

type Mixin<MixinMembers> = <T>(
  Base: Constructor<T>
) => Constructor<T & MixinMembers>;

declare const MapMethodsMixin: Mixin<{
  reverse(options?: any): any;
  shuffle(options?: any): any;
  sort(options?: any): any;
  withKeys(keysSource: any, options?: any): any;
}>;

export default MapMethodsMixin;
