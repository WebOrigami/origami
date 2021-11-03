import FileLoadersMixin from "../node/FileLoadersMixin.js";
import ImplicitModulesMixin from "../node/ImplicitModulesMixin.js";
import FormulasMixin from "./FormulasMixin.js";
import SplatKeysMixin from "./SplatKeysMixin.js";

export default function MetaMixin(Base) {
  return class Meta extends FileLoadersMixin(
    FormulasMixin(SplatKeysMixin(ImplicitModulesMixin(Base)))
  ) {};
}
