import { type NextApiRequest, type NextApiResponse } from "next";
import * as pg from "pg";
import { env } from "../../env.mjs";
import fs from "fs";

// const {DB_PASSWORD, DB_USER, DB_HOST, DB_PORT, DB_NAME} = env;
const { STRING } = env;
const { Client, Pool } = pg;

export default async function createCredential(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  interface RequestBody {
    event: string;
  }

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

  const { event }: RequestBody = req.body as RequestBody;

  try {
    if (event) {
      await client.connect();
      const events = await client.query(
        `SELECT * FROM is_used`,
      );
      await client.end();
      if (!events.rows.length) {
        return res.json({
          err: "Event not found",
        });
      }else {
        const eventArray = events.rows.map(event => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const info =  `Event: ${event.event}, Code: ${event.code}, Used: ${event.used}`
            fs.appendFile('event.txt', info + '\n', function (err) {
                if (err) throw err;
              }
            );
            return info
        })
        return res.json({
            eventArray,
            });
      }
    } 
  } catch (err) {
    res.json({
      err,
    });
  }
}
