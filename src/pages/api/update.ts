import * as pg from 'pg';
import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from '../../env.mjs';

const { Client, Pool } = pg;
const { STRING } = env;

export default async function updatePg(
  req: NextApiRequest,
  res: NextApiResponse,
) {
//   const createTableString = `
//   CREATE TABLE is_used (
//     code text,
//     used boolean,
//     event text,
// );`
// const newItemString = `INSERT INTO is_used (code, used) VALUES ('${code}', ${used})`;

// const set = new Set();
// while(set.size < 1000) {
//   const code = crypto.randomBytes(3).toString('hex');
//   set.add(code);
// }
// const arr = Array.from(set);
// console.log(arr);
// for(const code of arr) {
//   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
//   const newItemString = `INSERT INTO is_used (code, used) VALUES ('${code}', ${used})`;
//   await client.query(newItemString);
// }
// const vals = await client.query('SELECT * FROM is_used');
  
  // const client = new Client({
  //   password: "admin",
  //    user: "admin",
  //     host: "localhost",
  //     port: 5432,
  //     database: "demodb",
  // })
  

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

  try {
    await client.connect();
    // const checkIfUsed = await client.query(`SELECT * FROM is_used WHERE code='${'c8292c'}'`);
    const updateUsedStatus = await client.query(
      `UPDATE is_used SET used=false WHERE code='${'81fad3'}'`,
    );
    console.log(updateUsedStatus);
    await client.end();

    return res.json({
      updateUsedStatus,
    });
  } catch (err) {
    res.json({
      err,
    });
  }
}
