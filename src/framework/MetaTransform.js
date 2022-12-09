import FileLoadersTransform from "../common/FileLoadersTransform.js";
import ImplicitModulesTransform from "../common/ImplicitModulesTransform.js";
import FormulasTransform from "./FormulasTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import KeysTransform from "./KeysTransform.js";
import PathTransform from "./PathTransform.js";

export default function MetaTransform(Base) {
  return class Meta extends PathTransform(
    InheritScopeTransform(
      FormulasTransform(
        FileLoadersTransform(ImplicitModulesTransform(KeysTransform(Base)))
      )
    )
  ) {};
}
