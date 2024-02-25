import { type NextApiRequest, type NextApiResponse } from "next";
import * as pg from "pg";
import { env } from "../../env.mjs";

const { STRING } = env;
const { Client, Pool } = pg;

export default async function createCredential(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  //   const client = new Client({
  //     password: DB_PASSWORD,
  //     user: DB_USER,
  //     host: DB_HOST,
  //     port: Number(DB_PORT),
  //     database: DB_NAME,
  //   });

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
    const returnItem = [];
    const events = [
      "FluenceBooth",
      "ProofOfData",
      "DePinDay",
      "DeSciDay",
      "OpenDataDay",
      "TalentDaoHackerHouse",
      "Aspecta",
      "CharmVerse",
    ];
    for (const event of events) {
      const item = await client.query(
        `SELECT * FROM is_used WHERE event='${event}' AND used=false LIMIT 1`,
      );
      console.log(item);
      returnItem.push(item.rows[0]);
    }
    await client.end();
    return res.json(returnItem);
  } catch (err) {
    res.json({
      err,
    });
  }
}
