import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { type RuntimeCompositeDefinition } from "@composedb/types";
import { DID } from "dids";
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
  const authenticateDID = async(seed: string) => {
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
        if(SECRET_KEY) {
            const did = await authenticateDID(SECRET_KEY);
            composeClient.setDID(did);
            console.log(did.id)
        const exists = await composeClient.executeQuery<{
            node: {
              pointAttestationsList: {
                edges: {
                  node: {
                    id: string;
                    issuer: {
                        id: string;
                        };
                    recipient: {
                        id: string;
                    };
                    data: {
                      value: number;
                      refId: string;
                      timestamp: string;
                      context: string;
                    }[];
                  };
                }[];
              };
            };
          } | null>(`
          query CheckPointAttestations {
            node(id: "${did.id}") {
              ... on CeramicAccount {
                    pointAttestationsList(filters: { where: { recipient: { equalTo: "${`did:pkh:eip155:${chainId}:${address}`}" } } }, first: 1) {
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
                            recipient {
                                id
                            }
                         }
                      }
                    }
                  }
                }
              }
          `);
          //filter the data to check if a point attestation exists with an issuer that matches did:key:z6MknfS5JdwaTV52StbPjzxZcZftJSkyfLT2oje66aa5Fajm
          const filtered = exists.data?.node.pointAttestationsList.edges.filter((edge) => edge.node.recipient.id === `${`did:pkh:eip155:${chainId}:${address}`}`);
        if (filtered?.length) {
            console.log("Point attestation already exists");
            //replace any refId null values with an empty string
            const existingData = filtered[0]?.node?.data
                .map((data) => {
                    if (data.refId === null) {
                        data.refId = "";
                    }
                    return data;
                });
            const dataToAppend = [ {
                value: parseInt(value),
                timestamp: new Date().toISOString(),
                context: context,
                refId: refId ?? "",
            }];
            existingData?.forEach((data) => {
                dataToAppend.push({
                    value: data.value,
                    timestamp: data.timestamp,
                    context: data.context,
                    refId: data.refId,
                });
            }
            );
            const data = await composeClient.executeQuery<{
                pointAttestations: {
                  id: string;
                  issuer: {
                    id: string;
                  };
                  data: {
                    value: number;
                    refId: string;
                    timestamp: string;
                    context: string;
                  }[];
                };
            }>(`
            mutation {
                updatePointAttestations(
                  input: {
                    id: "${filtered[0]?.node?.id ?? ''}",
                    content: {
                        data: ${JSON.stringify(dataToAppend).replace(/"([^"]+)":/g, '$1:')}
                    }
                  }
                ) {
                  pointAttestations: document {
                    id
                    issuer {
                      id
                    }
                    data {
                        value
                        refId
                        timestamp
                        context
                        }
                  }
                }
              }
            `);
            return res.json(data);
        } else {
            console.log('Creating new point attestation')
            const input = [
                {
                  value: parseInt(value),
                  context,
                  timestamp: new Date().toISOString(),
                  refId: refId ?? "",
                }
              ]
            const data = await composeClient.executeQuery<{
                createPointAttestations: {
                  document: {
                    id: string;
                    issuer: {
                      id: string;
                    };
                  };
                };
            }>(`
              mutation  {
                createPointAttestations(input: {
                  content: {
                    recipient: "${`did:pkh:eip155:${chainId}:${address}`}",
                    data: ${JSON.stringify(input).replace(/"([^"]+)":/g, '$1:')}
                  }
                })
                {
                  document {
                   id
                   issuer {
                    id
                  }
                  }
                }
              }
              `);
              return res.json(data);
          }
        }
    } catch (err) {
      res.json({
        err,
      });
    }
  }