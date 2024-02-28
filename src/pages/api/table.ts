// import * as pg from "pg";
// import { type NextApiRequest, type NextApiResponse } from "next";
// import crypto from "crypto";
// import { env } from "../../env.mjs";

// const { STRING } = env;
// const { Client, Pool } = pg;

// export default async function updatePg(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   // const client = new Client({
//   //   password: "admin",
//   //   user: "admin",
//   //   host: "localhost",
//   //   port: 5432,
//   //   database: "demodb",
//   // });

//   if (!STRING) {
//     return res.json({
//       err: "Missing connection string",
//     });
//   }

//   const pool = new Pool({
//     connectionString: STRING,
//   });

//   await pool.query("SELECT NOW()");
//   await pool.end();

//   const client = new Client({
//     connectionString: STRING,
//   });

//   try {
//     await client.connect();
//     const createTableString = `
//   CREATE TABLE is_used (
//     id SERIAL PRIMARY KEY,
//     code text UNIQUE,
//     used boolean,
//     event text)
// `;

//     const createEmailString = `
//   CREATE TABLE emails (
//     id SERIAL PRIMARY KEY,
//     address text,
//     email text UNIQUE)
// `;
//     await client.query(createTableString);
//     await client.query(createEmailString);
//     const set = new Set();
//     while (set.size < 16000) {
//       const code = crypto.randomBytes(6).toString("hex");
//       set.add(code);
//     }
//     const arr = Array.from(set);
//     let i = 0;
//     for (const code of arr) {
//       let e;
//       i < 2000
//         ? (e = "FluenceBooth")
//         : i < 4000
//           ? (e = "ProofOfData")
//           : i < 6000
//             ? (e = "DePinDay")
//             : i < 8000
//               ? (e = "DeSciDay")
//               : i < 10000
//                 ? (e = "OpenDataDay")
//                 : i < 12000
//                   ? (e = "TalentDaoHackerHouse")
//                   : i < 14000
//                   ? (e = "Aspecta") : (e = "CharmVerse");
//       // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
//       const newItemString = `INSERT INTO is_used (code, used, event) VALUES ('${code}', false, '${e}')`;
//       await client.query(newItemString);
//       i++;
//     }
//     const vals = await client.query("SELECT * FROM is_used");
//     await client.end();

//     return res.json({
//       vals,
//     });
//   } catch (err) {
//     res.json({
//       err,
//     });
//   }
// }
