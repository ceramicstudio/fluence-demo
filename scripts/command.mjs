import { randomBytes } from "crypto";
import { toString } from "uint8arrays/to-string";

export const RunCommands = () => {
  const generateAdminKeyDid = () => {
    const seed = new Uint8Array(randomBytes(32));
    return {
      SECRET_KEY: toString(seed, "base16"),
    };
  };
  const item = generateAdminKeyDid();
  console.log(item);
};
RunCommands();
