import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { type RuntimeCompositeDefinition } from "@composedb/types";
import { DID, type DagJWS } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { type NextApiRequest, type NextApiResponse } from "next";
import { fromString } from "uint8arrays/from-string";
import { env } from "../../env.mjs";
import { definition } from "../../__generated__/definition.js";

const { SECRET_KEY } = env;

export default async function createPoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  interface RequestBody {
    address: string;
    value: string;
    context: string;
    chainId: string;
    refId?: string;
  }

  const { address, value, context, refId, chainId }: RequestBody = req.body as RequestBody;

  if (!SECRET_KEY) {
    return res.json({
      err: "Missing key",
    });
  }

  const ceramic = new CeramicClient('https://ceramic-demo.hirenodes.io');

  //instantiate a composeDB client instance
  const composeClient = new ComposeClient({
    ceramic: 'https://ceramic-demo.hirenodes.io',
    definition: definition as RuntimeCompositeDefinition,
  });

  //authenticate developer DID in order to create a write transaction
  const authenticateDID = async (seed: string) => {
    const key = fromString(seed, "base16");
    const provider = new Ed25519Provider(key);
    const staticDid = new DID({
      // @ts-expect-error: Ignore type error
      resolver: KeyResolver.getResolver(),
      provider
    });
    await staticDid.authenticate();
    ceramic.did = staticDid;
    return staticDid;
  }

  try {
    if (SECRET_KEY) {
      const did = await authenticateDID(SECRET_KEY);
      composeClient.setDID(did);
      console.log(did.id)
      const exists = await composeClient.executeQuery<{
        node: {
          pointClaimsList: {
            edges: {
              node: {
                id: string;
                data: {
                  value: number;
                  refId: string;
                  timestamp: string;
                  context: string;
                }[];
                issuer: {
                  id: string;
                };
                holder: {
                  id: string;
                };
                issuer_verification: string;
              };
            }[];
          };
        } | null;
      }>(`
          query CheckPointClaims {
            node(id: "${`did:pkh:eip155:${chainId}:${address.toLowerCase()}`}") {
              ... on CeramicAccount {
                    pointClaimsList(filters: { where: { issuer: { equalTo: "${did.id}" } } }, first: 1) {
                      edges {
                        node {
                            id
                            data {
                              value
                              refId
                              timestamp
                              context
                            }
                            issuer {
                                id
                            }
                            holder {
                                id
                            }
                            issuer_verification
                         }
                      }
                    }
                  }
                }
              }
          `);
      if (!exists?.data?.node?.pointClaimsList?.edges.length) {
        const dataToAppend = [{
          value: parseInt(value),
          timestamp: new Date().toISOString(),
          context: context,
          refId: refId ?? undefined,
        }];
        if (!refId) {
          delete dataToAppend[0]?.refId;
        }
        const jws = await did.createJWS(dataToAppend);
        const jwsJsonStr = JSON.stringify(jws);
        const jwsJsonB64 = Buffer.from(jwsJsonStr).toString("base64");
        const completePoint = {
          dataToAppend,
          issuer_verification: jwsJsonB64,
          streamId: "",
        };
        return res.json({
          completePoint
        });
      } else {
        const dataToVerify = exists?.data?.node?.pointClaimsList?.edges[0]?.node?.issuer_verification;
        const json = Buffer.from(dataToVerify!, "base64").toString();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const parsed = JSON.parse(json) as DagJWS;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const newDid = new DID({ resolver: KeyResolver.getResolver() });
        const result = parsed.payload
          ? await newDid.verifyJWS(parsed)
          : undefined;
        const didFromJwt = result?.payload
          ? result?.didResolutionResult.didDocument?.id
          : undefined;
        if (didFromJwt === did.id) {
          const existingData = result?.payload;
          const dataToAppend = [{
            value: parseInt(value),
            timestamp: new Date().toISOString(),
            context: context,
            refId: refId ?? undefined,
          }];
          if (!refId) {
            delete dataToAppend[0]?.refId;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          existingData?.forEach((data: {
            value: number;
            timestamp: string;
            context: string;
            refId: string;
          }) => {
            dataToAppend.push({
              value: data.value,
              timestamp: data.timestamp,
              context: data.context,
              refId: data.refId,
            });
          });
          const jws = await did.createJWS(dataToAppend);
          const jwsJsonStr = JSON.stringify(jws);
          const jwsJsonB64 = Buffer.from(jwsJsonStr).toString("base64");
          const completePoint = {
            dataToAppend,
            issuer_verification: jwsJsonB64,
            streamId: exists?.data?.node?.pointClaimsList?.edges[0]?.node?.id,
          };
          return res.json({
            completePoint
          });
        } else {
          return res.json({
            err: "Invalid issuer",
          });
        }
      }
    }
  } catch (err) {
    res.json({
      err,
    });
  }
}