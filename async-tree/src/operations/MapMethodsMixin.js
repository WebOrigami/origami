import reverse from "../operations/reverse.js";
import shuffle from "../operations/shuffle.js";
import sort from "../operations/sort.js";
import withKeys from "../operations/withKeys.js";

export default function MapMethodsMixin(Base) {
  return class MapMethods extends Base {
    reverse() {
      return reverse(this);
    }
    shuffle(options) {
      return shuffle(this, options);
    }

    sort(options) {
      return sort(this, options);
    }

    withKeys(keysSource, options) {
      return withKeys(this, keysSource, options);
    }
  };
}
