import { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount, useChainId } from "wagmi";
import { useComposeDB } from "@/fragments";
import { DNA } from "react-loader-spinner";
import { DID, type DagJWS } from "dids";
import KeyResolver from "key-did-resolver";

type EventString =
  | "OpenDataDay"
  | "FluenceBooth"
  | "DePinDay"
  | "DeSciDay"
  | "TalentDaoHackerHouse"
  | "ProofOfData"
  | "Aspecta"
  | "CharmVerse";

interface Attestation {
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

const badgeNames = {
  OpenDataDay: "Open Data Day",
  FluenceBooth: "Fluence Booth",
  DePinDay: "DePIN Day",
  DeSciDay: "SciOS24",
  TalentDaoHackerHouse: "Silk Hacker House",
  ProofOfData: "Proof of Data",
  AllBadges: "All Badges Threshhold",
  ThreeBadges: "Three Badges Threshhold",
  Aspecta: "Builders Day (Aspecta)",
  CharmVerse: "CharmVerse Booth",
};

const countObject = {
  OpenDataDay: 0,
  FluenceBooth: 0,
  DePinDay: 0,
  DeSciDay: 0,
  TalentDaoHackerHouse: 0,
  ProofOfData: 0,
  Aspecta: 0,
  CharmVerse: 0,
  ThreeBadges: 0,
  AllBadges: 0,
};

const imageMapping = {
  OpenDataDay: "/opendata.png",
  FluenceBooth: "/fluence.png",
  DePinDay: "/depin.png",
  DeSciDay: "/desci.png",
  TalentDaoHackerHouse: "/talentdao.png",
  ProofOfData: "/proofdata.png",
  Aspecta: "/aspecta.png",
  AllBadges: "/all.png",
  ThreeBadges: "/final.png",
  CharmVerse: "/charmverse.png",
};

export default function Leader() {
  const [count, setCount] = useState<typeof countObject>(countObject);
  const { compose } = useComposeDB();
  const [max, setMax] = useState<number>(0);
  const [participantCount, setParticipantCount] = useState<number | string>(0);
  const { address } = useAccount();
  const chainId = useChainId();

  const findEvent = async () => {
    await checkParticipants();
  };

  const getDid = async () => {
    try {
      const result = await fetch("/api/checkdid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      type returnType = {
        err?: unknown;
        did: string;
      };
      const finalDid = (await result.json()) as returnType;
      console.log(finalDid);
      return finalDid.did;
    } catch (e) {
      console.log(e);
    }
  }

  const checkValid = async (events: Attestation[]) => {
    const returnVal: Attestation[] = [];
    const did = await getDid();
    for (const el of events) {
      const json = Buffer.from(el.issuer_verification, "base64").toString();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = JSON.parse(json) as DagJWS;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const newDid = new DID({ resolver: KeyResolver.getResolver() });
      const result = parsed.payload
        ? await newDid.verifyJWS(parsed)
        : undefined;
      const didFromJwt = result?.payload
        ? result.didResolutionResult.didDocument?.id
        : undefined;
      console.log(didFromJwt, address?.toLowerCase());
      if (
        didFromJwt ===
        did 
      ) {
        console.log(result, el);
        returnVal.push(el);
      }
    }
    return returnVal;
  };

  const checkParticipants = async () => {
    const did = await getDid();
    const data = await compose.executeQuery<{
      pointClaimsCount: number;
    }>(`
        query Count{
          pointClaimsCount
        }
      `);
    console.log(data);
    const data2 = await compose.executeQuery<{
      pointClaimsIndex: {
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
    }>(`
        query CheckPointClaims {
         pointClaimsIndex(filters: { where: { issuer: { equalTo: "${did}" } } }, first: ${data.data?.pointClaimsCount}) {
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
        `);
    console.log(data2);
    const results = data2.data?.pointClaimsIndex.edges.map((el) => {
      return el.node;
    }
    );
    console.log(results);
    if (results) {
      const final = await checkValid(results);
      console.log(final);

      //sum the values within the data array for each event based on context
      final.forEach((el) => {
        const dataArray = el.data;
        dataArray.forEach((data) => {
          const context = data.context as EventString;
          if (context in countObject) {
            countObject[context] += data.value;
          }
        });
      } 
      );
      console.log(countObject);
      const arr = Object.values(countObject);
      const maximum = Math.max(...arr);
      setMax(maximum);
      setCount(countObject);
    }
  };

  useEffect(() => {
    void findEvent();
  }, [address, chainId]);

  return (
    <div className="flex min-h-screen min-w-full flex-col items-center justify-start gap-6 px-4 py-8 sm:py-16 md:py-24">
      <div
        className="ring-black-600 w-full rounded-md bg-gray-900 p-6 shadow-xl shadow-rose-600/40"
        style={{ height: "fit-content", minHeight: "35rem" }}
      >
        <div className="justify-left flex-auto flex-row flex-wrap items-center">
          {max > 0 ? (
            Object.keys(badgeNames).map((badge, index) => {
              return (
                <>
                  <div
                    className="m-2 mt-4 min-h-48 w-auto max-w-full shrink-0  bg-gray-900 shadow-lg shadow-rose-600/40 p-4"
                    key={badge}
                  >
                    <div className="flex flex-col items-center justify-evenly">
                      <p className="m-auto text-center font-semibold text-orange-500">
                        {badgeNames[badge as keyof typeof badgeNames]}
                      </p>
                      <Image
                        src={imageMapping[badge as keyof typeof imageMapping]}
                        alt={badge}
                        width={150}
                        height={150}
                      />
                    </div>
                    {count[badge as keyof typeof countObject] ? (
                      <div className="mt-7 flex w-full flex-row items-center justify-start">
                        <div className="flex w-full flex-col items-center justify-start">
                          <div className="flex w-full flex-row items-center justify-start">
                          </div>
                          <p className="text-center text-slate-200">
                            {count[badge as keyof typeof countObject]} Points Claimed
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-7 flex w-full flex-row items-center justify-start">
                        <div className="flex w-full flex-col items-center justify-start">
                          <div className="flex w-full flex-row items-center justify-start">
                          </div>
                          <p className="text-center text-slate-200">
                            0 Points Claimed
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })
          ) : participantCount === "none" ?
            (
              Object.keys(badgeNames).map((badge, index) => {
                return (
                  <>
                    <div
                      className="m-2 mt-4 min-h-48 w-auto max-w-full shrink-0  bg-gray-900 shadow-lg shadow-rose-600/40 p-4"
                      key={badge}
                    >
                      <div className="flex flex-col items-center justify-evenly">
                        <p className="m-auto text-center font-semibold text-orange-500">
                          {badgeNames[badge as keyof typeof badgeNames]}
                        </p>
                        <Image
                          src={imageMapping[badge as keyof typeof imageMapping]}
                          alt={badge}
                          width={150}
                          height={150}
                        />
                      </div>
                      {count[badge as keyof typeof countObject] ? (
                        <div className="mt-7 flex w-full flex-row items-center justify-start">
                          <div className="flex w-full flex-col items-center justify-start">
                            <div className="flex w-full flex-row items-center justify-start">
                            </div>
                            <p className="text-center text-slate-200">
                              {count[badge as keyof typeof countObject]} Points Claimed
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-7 flex w-full flex-row items-center justify-start">
                          <div className="flex w-full flex-col items-center justify-start">
                            <div className="flex w-full flex-row items-center justify-start">
                            </div>
                            <p className="text-center text-slate-200">
                              0 Points Claimed
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })
            ) :
            (
              <div className="m-auto flex w-full flex-col items-center justify-center">
                <DNA height={100} width={100} />
                <p className="text-center text-slate-200">Loading Event Data...</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
