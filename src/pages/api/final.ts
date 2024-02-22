import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { type NextApiRequest, type NextApiResponse } from "next";
import { fromString } from "uint8arrays/from-string";
import { env } from "../../env.mjs";

const { SECRET_KEY } = env;

export default async function createCredential(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  interface RequestBody {
    recipient: string;
    FluenceBooth: string;
    ProofOfData: string;
    DePinDay: string;
    DeSciDay: string;
    OpenDataDay: string;
    TalentDaoHackerHouse: string;
    Aspecta: string;
    event: string;
  }

  const {
    recipient,
    FluenceBooth,
    ProofOfData,
    DePinDay,
    DeSciDay,
    OpenDataDay,
    TalentDaoHackerHouse,
    Aspecta,
    event,
  }: RequestBody = req.body as RequestBody;

  try {
    const key = fromString(SECRET_KEY, "base16");
    const provider = new Ed25519Provider(key);
    const staticDid = new DID({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      resolver: KeyResolver.getResolver(),
      provider,
    });
    console.log(req.body);
    await staticDid.authenticate();
    const badge: {
      recipient: string;
      FluenceBooth: string;
      ProofOfData: string;
      DePinDay: string;
      DeSciDay: string;
      OpenDataDay: string;
      TalentDaoHackerHouse: string;
      Aspecta: string;
      timestamp: string;
      event: string;
    } = {
      recipient: recipient.toLowerCase(),
      FluenceBooth,
      ProofOfData,
      DePinDay,
      DeSciDay,
      OpenDataDay,
      TalentDaoHackerHouse,
      Aspecta,
      timestamp: new Date().toISOString(),
      event,
    };
    console.log(badge);

    const jws = await staticDid.createJWS(badge);
    const jwsJsonStr = JSON.stringify(jws);
    const jwsJsonB64 = Buffer.from(jwsJsonStr).toString("base64");
    const completeBadge = {
      ...badge,
      jwt: jwsJsonB64,
    };
    return res.json(completeBadge);
  } catch (err) {
    res.json({
      err,
    });
  }
}
