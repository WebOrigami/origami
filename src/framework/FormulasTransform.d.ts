/// <reference path="../core/explorable.ts"/>

import Formula from "./Formula.js";

declare const FormulasTransform: Mixin<{
  formulas(): Promise<Formula[]>;
  matchAll(key: string): Promise<any[]>;
  scope: Explorable;
}>

export function isFormulasTransformApplied(obj: any): boolean;

export default FormulasTransform;
