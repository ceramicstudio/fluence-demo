import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { type NextApiRequest, type NextApiResponse } from "next";
import { fromString } from "uint8arrays/from-string";
import * as pg from "pg";
import { env } from '../../env';

// const {SECRET_KEY, DB_PASSWORD, DB_USER, DB_HOST, DB_PORT, DB_NAME} = env;
const {STRING, SECRET_KEY} = env;
const { Client, Pool } = pg;

export default async function createCredential(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  interface RequestBody {
    location: {
      latitude: number;
      longitude: number;
    };
    recipient: string;
    event: string;
    code: string;
  }

  // const client = new Client({
  //   password: DB_PASSWORD,
  //   user: DB_USER,
  //   host: DB_HOST,
  //   port: Number(DB_PORT),
  //   database: DB_NAME,
  // });

  if(!STRING) {
    return res.json({
      err: "Missing connection string"
    })
  }

  const pool = new Pool({
    connectionString: STRING,
  });

  await pool.query("SELECT NOW()");
  await pool.end();

  const client = new Client({
    connectionString: STRING,
  });

  const { location, recipient, code }: RequestBody =
    req.body as RequestBody;

  try {
    console.log(env);
    if (code && SECRET_KEY) {
      await client.connect();
      const checkIfUsed = await client.query(
        `SELECT * FROM is_used WHERE code='${code}'`,
      );
      if (!checkIfUsed.rows.length) {
        await client.end();
        return res.json({
          err: "Code not found",
        });
      } else if ((checkIfUsed.rows[0] as { used: boolean }).used) {
        await client.end();
        return res.json({
          err: "Code already used",
        });
      } else {
        const event = (checkIfUsed.rows[0] as { event: string }).event;
        const key = fromString(SECRET_KEY, "base16");
        const provider = new Ed25519Provider(key);
        const staticDid = new DID({
          resolver: KeyResolver.getResolver(),
          provider,
        });

        await staticDid.authenticate();
        const badge: {
          recipient: string;
          event: string;
          timestamp: string;
          latitude?: number; 
          longitude?: number; 
        } = {
          recipient: recipient.toLowerCase(),
          event: event,
          timestamp: new Date().toISOString(),
        };
        location.latitude !== undefined && (badge.latitude = location.latitude);
        location.longitude !== undefined && (badge.longitude = location.longitude);
        console.log(badge);

        const jws = await staticDid.createJWS(badge);
        const jwsJsonStr = JSON.stringify(jws);
        const jwsJsonB64 = Buffer.from(jwsJsonStr).toString("base64");
        const completeBadge = {
          ...badge,
          jwt: jwsJsonB64,
        };
        await client.query(
          `UPDATE is_used SET used=true WHERE code='${code}'`,
        );
        await client.end();
        return res.json(completeBadge);
      }
    } else {
      return res.json({
        err: "Missing code or unique key",
      });
    }
  } catch (err) {
    res.json({
      err,
    });
  }
}
