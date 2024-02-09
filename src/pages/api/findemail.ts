import { type NextApiRequest, type NextApiResponse } from "next";
import * as pg from "pg";
import { env } from "../../env";

const { STRING } = env;
const { Client, Pool } = pg;

export default async function createCredential(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  interface RequestBody {
    address: string;
  }

  const { address }: RequestBody = req.body as RequestBody;

  if (!STRING) {
    return res.json({
      err: "Missing connection string",
    });
  }

  if (!address) {
    return res.json({
      err: "Missing address",
    });
  }

  const pool = new Pool({
    connectionString: STRING,
  });

  const poolq = await pool.query("SELECT NOW()");
  await pool.end();

  const client = new Client({
    connectionString: STRING,
  });

  try {
    console.log(env);
    await client.connect();
    const containsEmail = await client.query(
      `SELECT * FROM emails WHERE address='${address.toLowerCase()}'`,
    );
    await client.end();
    return res.json({
      rows: containsEmail.rows,
    });
  } catch (err) {
    res.json({
      err,
    });
  }
}
