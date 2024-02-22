// import { type NextApiRequest, type NextApiResponse } from "next";
// import * as pg from "pg";
// import { env } from "../../env.mjs";

// const { STRING } = env;
// const { Client, Pool } = pg;

// export default async function createCredential(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   if (!STRING) {
//     return res.json({
//       err: "Missing connection string",
//     });
//   }

//   const pool = new Pool({
//     connectionString: STRING,
//   });

//   const poolq = await pool.query("SELECT NOW()");
//   await pool.end();

//   const client = new Client({
//     connectionString: STRING,
//   });

//   try {
//     await client.connect();
//     const dropString = `DROP TABLE is_used`;
//     const result = await client.query(dropString);
//     await client.end();
//     return res.json({
//       result
//     });
//   } catch (err) {
//     res.json({
//       err,
//     });
//   }
// }
