import FileLoadersMixin from "../node/FileLoadersMixin.js";
import ImplicitModulesMixin from "../node/ImplicitModulesMixin.js";
import FallbackMixin from "./FallbackMixin.js";
import FormulasMixin from "./FormulasMixin.js";
import InheritScopeMixin from "./InheritScopeMixin.js";
// import SplatKeysMixin from "./SplatKeysMixin.js";

export default function MetaMixin(Base) {
  return class Meta extends FileLoadersMixin(
    InheritScopeMixin(FormulasMixin(FallbackMixin(ImplicitModulesMixin(Base))))
  ) {};
}
