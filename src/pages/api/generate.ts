// import { type NextApiRequest, type NextApiResponse } from "next";
// import * as pg from "pg";
// import { env } from "../../env.mjs";
// import fs from "fs";

// // const {DB_PASSWORD, DB_USER, DB_HOST, DB_PORT, DB_NAME} = env;
// const { STRING } = env;
// const { Client, Pool } = pg;

// export default async function createCredential(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
// //   interface RequestBody {
// //     event: string;
// //   }

//   if(!STRING) {
//     return res.json({
//       err: "Missing connection string"
//     })
//   }

//   const pool = new Pool({
//     connectionString: STRING,
//   });

//   await pool.query("SELECT NOW()");
//   await pool.end();

//   const client = new Client({
//     connectionString: STRING,
//   });

// //   const { event }: RequestBody = req.body as RequestBody;

// //   let e;
// //       i < 2000
// //         ? (e = "FluenceBooth")
// //         : i < 4000
// //           ? (e = "ProofOfData")
// //           : i < 6000
// //             ? (e = "DePinDay")
// //             : i < 8000
// //               ? (e = "DeSciDay")
// //               : i < 10000
// //                 ? (e = "OpenDataDay")
// //                 : i < 12000
// //                   ? (e = "TalentDaoHackerHouse")
// //                   : i < 14000
// //                   ? (e = "Aspecta") : (e = "CharmVerse");

//   try {
//     if (STRING) {
//       await client.connect();
//       const events = await client.query(
//         `SELECT * FROM is_used`,
//       );
//       await client.end();
//       if (!events.rows.length) {
//         return res.json({
//           err: "Event not found",
//         });
//       }else {
//         const eventArray = events.rows.map(event => {
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//             const url =  `https://fluence-staging.netlify.app/?code=${event.code}`
//             // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//             const url2 =  `https://points.ceramic.network/?code=${event.code}`
//             fs.appendFile(`${event.event}.txt`, url + '\n', function (err) {
//                 if (err) throw err;
//               }
//             );
//             fs.appendFile(`${event.event}.txt`, url2 + '\n', function (err) {
//                 if (err) throw err;
//               }
//             );
//             return url
//         })
//         return res.json({
//             eventArray,
//             });
//       }
//     } 
//   } catch (err) {
//     res.json({
//       err,
//     });
//   }
// }
