/// <reference path="../core/explorable.ts"/>

import Formula from "./Formula.js";

declare const FormulasTransform: Mixin<{
  scope: Explorable;
}>;

export function sortFormulas(formulas: Formula[]): void;

export default FormulasTransform;
