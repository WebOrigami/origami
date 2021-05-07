import { WildcardKeysMixin } from "../../core/exports.js";
import {
  Files,
  VirtualKeysMixin,
  VirtualValuesMixin,
} from "../../node/exports.js";
import DefaultPagesMixin from "./DefaultPagesMixin.js";

// DefaultPagesMixin(Files) so that DefaultPagesMixin can respect real index.html

// DefaultPagesMixin(VirtualKeys(...)) so that VirtualKeys can provide keys to index.html

// WildcardGraph(DefaultPagesMixin(...)) so that DefaultPagesMixin can provide index.html
// without triggering :notFound wildcard

// DefaultPagesMixin(VirtualFiles(...)) so that VirtualFiles can generate a dynamic index.html

// WildcardGraph(VirtualFiles(...)) so that VirtualFiles can generate a wildcard function
// that WildcardGraph can resolve

export default class ExplorableApp extends WildcardKeysMixin(
  DefaultPagesMixin(VirtualValuesMixin(VirtualKeysMixin(Files)))
) {}
