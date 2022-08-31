/// <reference path="../core/explorable.ts"/>

declare const FormulasTransform: Mixin<{
  addKey(key: any, options?: object): void;
  allKeys(): Promise<any[]>;
  keyAdded(key: string, existingKeys: any[]): Promise<object | void>;
  publicKeys(): Promise<any[]>;
  realKeys(): Promise<any[]>;
}>;

export default FormulasTransform;
