import FileLoadersMixin from "../node/FileLoadersMixin.js";
import ImplicitModulesMixin from "../node/ImplicitModulesMixin.js";
import FormulasMixin from "./FormulasMixin.js";

export default function MetaMixin(Base) {
  return class Meta extends FileLoadersMixin(
    FormulasMixin(ImplicitModulesMixin(Base))
  ) {};
}
