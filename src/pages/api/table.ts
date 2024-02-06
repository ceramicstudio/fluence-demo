import * as pg from "pg";
import { type NextApiRequest, type NextApiResponse } from "next";
import crypto from "crypto";

const { Client } = pg;

export default async function updatePg(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const client = new Client({
    password: "admin",
    user: "admin",
    host: "localhost",
    port: 5432,
    database: "demodb",
  });

  try {
    await client.connect();
    const createTableString = `
  CREATE TABLE is_used (
    code text,
    used boolean,
    event text)
`;
    await client.query(createTableString);
    const set = new Set();
    while (set.size < 6000) {
      const code = crypto.randomBytes(3).toString("hex");
      set.add(code);
    }
    const arr = Array.from(set);
    let i = 0;
    for (const code of arr) {
      let e;
      i < 1000
        ? (e = "FluenceBooth")
        : i < 2000
          ? (e = "ProofOfData")
          : i < 3000
            ? (e = "DePinDay")
            : i < 4000
              ? (e = "DeSciDay")
              : i < 5000
                ? (e = "OpenDataDay")
                : (e = "TalentDAOHackerHouse");
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const newItemString = `INSERT INTO is_used (code, used, event) VALUES ('${code}', false, '${e}')`;
      await client.query(newItemString);
      i++;
    }
    const vals = await client.query("SELECT * FROM is_used");
    await client.end();

    return res.json({
      vals,
    });
  } catch (err) {
    res.json({
      err,
    });
  }
}
