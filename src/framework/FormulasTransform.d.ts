/// <reference path="../core/explorable.ts"/>

import Formula from "./Formula.js";

declare const FormulasTransform: Mixin<{
  allKeys(): Promise<any[]>;
  formulas(): Promise<Formula[]>;
  matchAll(key: string): Promise<any[]>;
  realKeys(): Promise<any[]>;
  virtualKeys(): Promise<any[]>;
  scope: Explorable;
}>;

export function isFormulasTransformApplied(obj: any): boolean;
export function sortFormulas(formulas: Formula[]): void;

export default FormulasTransform;
