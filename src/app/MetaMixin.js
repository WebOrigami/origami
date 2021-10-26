import FileLoadersMixin from "../node/FileLoadersMixin.js";
import ImplicitModulesMixin from "../node/ImplicitModulesMixin.js";
import FormulasMixin from "./FormulasMixin.js";
import VirtualKeysMixin from "./VirtualKeysMixin.js";

export default function MetaMixin(Base) {
  return class Meta extends FileLoadersMixin(
    VirtualKeysMixin(FormulasMixin(ImplicitModulesMixin(Base)))
  ) {};
}
