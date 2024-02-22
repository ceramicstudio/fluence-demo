import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { type RuntimeCompositeDefinition } from "@composedb/types";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { type NextApiRequest, type NextApiResponse } from "next";
import { fromString } from "uint8arrays/from-string";
import { env } from "../../env.mjs";

const { SECRET_KEY } = env;

export default async function createPoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  if (!SECRET_KEY) {
    return res.json({
      err: "Missing key",
    });
  }



  try {
    if (SECRET_KEY) {
      //authenticate developer DID in order to create a write transaction
      const key = fromString(SECRET_KEY, "base16");
      const provider = new Ed25519Provider(key);
      const staticDid = new DID({
        // @ts-expect-error: Ignore type error
        resolver: KeyResolver.getResolver(),
        provider
      });
      await staticDid.authenticate();
      return res.json({
        did: staticDid.id,
      });
    }
  } catch (err) {
    res.json({
      err,
    });
  }
}