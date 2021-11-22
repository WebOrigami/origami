import FileLoadersMixin from "../node/FileLoadersMixin.js";
import ImplicitModulesMixin from "../node/ImplicitModulesMixin.js";
import AdditionsMixin from "./AdditionsMixin.js";
import FormulasMixin from "./FormulasMixin.js";
import GhostValuesMixin from "./GhostValuesMixin.js";
import InheritScopeMixin from "./InheritScopeMixin.js";

export default function MetaMixin(Base) {
  return class Meta extends FileLoadersMixin(
    InheritScopeMixin(
      AdditionsMixin(
        FormulasMixin(GhostValuesMixin(ImplicitModulesMixin(Base)))
      )
    )
  ) {};
}
