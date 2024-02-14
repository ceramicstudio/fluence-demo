import { type NextApiRequest, type NextApiResponse } from "next";
import * as pg from "pg";
import { env } from "../../env.mjs";

const { STRING } = env;
const { Client, Pool } = pg;

export default async function createCredential(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!STRING) {
    return res.json({
      err: "Missing connection string",
    });
  }

  const pool = new Pool({
    connectionString: STRING,
  });

  await pool.query("SELECT NOW()");
  await pool.end();

  const client = new Client({
    connectionString: STRING,
  });

  try {
    await client.connect();
    const checkIfUsed = await client.query(
      `UPDATE is_used SET used=false WHERE used=true`,
    );
    //count all used codes
    const check = await client.query(
      `SELECT * FROM is_used WHERE used=false`,
    );
    await client.end();
    return res.json({
      success: "All codes are now available",
      unusedCodes: check.rows.length,
    });
  } catch (err) {
    res.json({
      err,
    });
  }
}
