/// <reference path="../core/explorable.ts"/>

declare const FormulasTransform: Mixin<{
  addKey(key: any, options?: object): void;
  allKeys(): Promise<any[]>;
  ensureKeys(): Promise<void>;
  getKeys(): Promise<void>;
  keyAdded(key: string, options: object, existingKeys: any[]): Promise<object | void>;
  keysAdded(keys: any[]): Promise<void>;
  publicKeys(): Promise<any[]>;
  realKeys(): Promise<any[]>;
}> & {
  // Static methods provided by transform
  realKeys(graph: Explorable): Promise<any[]>
};

export default FormulasTransform;
