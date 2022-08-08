import CachedValuesTransform from "../common/CachedValuesTransform.js";
import FileLoadersTransform from "../node/FileLoadersTransform.js";
import ImplicitModulesTransform from "../node/ImplicitModulesTransform.js";
import AdditionsTransform from "./AdditionsTransform.js";
import FormulasTransform from "./FormulasTransform.js";
import GhostValuesTransform from "./GhostValuesTransform.js";
import InheritScopeTransform from "./InheritScopeTransform.js";
import PathTransform from "./PathTransform.js";

export default function MetaTransform(Base) {
  return class Meta extends CachedValuesTransform(
    PathTransform(
      InheritScopeTransform(
        GhostValuesTransform(
          FormulasTransform(
            AdditionsTransform(
              FileLoadersTransform(ImplicitModulesTransform(Base))
            )
          )
        )
      )
    )
  ) {
    isKeyCachable(key) {
      return key.endsWith?.(".meta") ?? false;
    }
  };
}
