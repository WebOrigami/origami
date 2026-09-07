import crypto from "node:crypto";
import pack from "./pack.js";

export default function hash(value, algorithm = "sha1") {
  const buffer = pack(value);
  return crypto.createHash(algorithm).update(buffer).digest("hex");
}
