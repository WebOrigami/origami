import keysFromPath from "./keysFromPath.js";
import pathFromKeys from "./pathFromKeys.js";

/**
 * Like Node path.resolve(), but preserves relative paths. If given a relative
 * path as the first argument, and subsequent paths use `..` to traverse above
 * that point, the result of the function is null.
 *
 * @param  {string[]} paths
 */
export default function resolvePath(...paths) {
  const absolute = paths[0]?.startsWith("/");
  const keys = paths.flatMap(keysFromPath);
  const resolvedKeys = [];
  for (const key of keys) {
    switch (key) {
      case "":
        break;

      case ".":
        break;

      case "..":
        if (resolvedKeys.length === 0 && !absolute) {
          return null;
        }
        resolvedKeys.pop();
        break;

      default:
        resolvedKeys.push(key);
        break;
    }
  }

  let result = pathFromKeys(resolvedKeys);
  if (absolute) {
    result = "/" + result;
  } else if (resolvedKeys.length === 0) {
    return null;
  }

  return result;
}
