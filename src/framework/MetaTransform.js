import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FormulasTransform from "./FormulasTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import KeysTransform from "./KeysTransform.js";

export default function MetaTransform(Base) {
  return class Meta extends InheritScopeTransform(
    FormulasTransform(
      FileLoadersTransform(ImplicitModulesTransform(KeysTransform(Base)))
    )
  ) {};
}
