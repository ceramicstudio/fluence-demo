import { type NextApiRequest, type NextApiResponse } from "next";
import * as pg from "pg";
import { env } from "../../env";

const { DB_PASSWORD, DB_USER, DB_HOST, DB_PORT, DB_NAME } = env;
const { Client } = pg;

export default async function createCredential(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const client = new Client({
    password: DB_PASSWORD,
    user: DB_USER,
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_NAME,
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
      "TalentDAOHackerHouse",
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
