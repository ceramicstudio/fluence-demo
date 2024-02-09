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
    recipient: string;
    email: string;
  }

  const { recipient, email }: RequestBody = req.body as RequestBody;

  if (!STRING) {
    return res.json({
      err: "Missing connection string",
    });
  }

  if (!recipient.length || !email.length) {
    return res.json({
      err: "Missing recipient or email",
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
    const newEmailString = `INSERT INTO emails (address, email) VALUES ('${recipient.toLowerCase()}', '${email}')`;
    const result = await client.query(newEmailString);
    await client.end();
    return res.json({
      result: result.rows,
    });
  } catch (err) {
    res.json({
      err,
    });
  }
}
