import { WildcardKeysMixin } from "../../core/exports.js";
import {
  Files,
  VirtualKeysMixin,
  VirtualValuesMixin,
} from "../../node/exports.js";
// import DefaultPagesMixin from "./DefaultPagesMixin.js";

// DefaultPagesMixin(Files) so that DefaultPagesMixin can respect real index.html

// DefaultPagesMixin(VirtualKeys(...)) so that VirtualKeys can provide keys to index.html

// WildcardKeysMixin(DefaultPagesMixin(...)) so that DefaultPagesMixin can provide index.html
// without triggering :notFound wildcard

// BUT
// DefaultPagesMixin(WildcardKeysMixin(...)) so that WildcardKeysMixin can
// define an wildcard like :products/index.html.

// DefaultPagesMixin(VirtualFiles(...)) so that VirtualFiles can generate a dynamic index.html

// WildcardKeysMixin(VirtualFiles(...)) so that VirtualFiles can generate a wildcard function
// that WildcardKeysMixin can resolve

export default class ExplorableApp extends WildcardKeysMixin(
  VirtualKeysMixin(VirtualValuesMixin(Files))
) {}
