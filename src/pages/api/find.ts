import { type NextApiRequest, type NextApiResponse } from "next";
import * as pg from "pg";
import { env } from '../../env';

const {DB_PASSWORD, DB_USER, DB_HOST, DB_PORT, DB_NAME} = env;
const { Client } = pg;

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

  const client = new Client({
    password: DB_PASSWORD,
    user: DB_USER,
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
  });

  const { code }: RequestBody =
    req.body as RequestBody;

  try {
    console.log(env);
    if (code) {
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
        console.log(event);
        return res.json(event);
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
