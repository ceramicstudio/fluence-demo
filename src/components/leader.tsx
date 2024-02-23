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
  | "Aspecta";

interface Event {
  recipient: string;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
  timestamp: string;
  jwt: string;
  event: EventString;
  id: string;
}

const badgeNames = {
  OpenDataDay: "Open Data Day",
  FluenceBooth: "Fluence Booth",
  DePinDay: "DePIN Day",
  DeSciDay: "SciOS24",
  TalentDaoHackerHouse: "Silk Hacker House",
  ProofOfData: "Proof of Data",
  AllBadges: "All Badges Threshhold",
  ThreeBadges: "Three Badges Threshhold",
  Aspecta: "Builders Day EthDenver Edition by Polyhedra & Aspecta",
};

const countObject = {
  OpenDataDay: 0,
  FluenceBooth: 0,
  DePinDay: 0,
  DeSciDay: 0,
  TalentDaoHackerHouse: 0,
  ProofOfData: 0,
  Aspecta: 0,
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
};

export default function Leader() {
  const [count, setCount] = useState<typeof countObject>(countObject);
  const { compose } = useComposeDB();
  const [max, setMax] = useState<number>(0);
  const [participantCount, setParticipantCount] = useState<number>(0);
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

  const checkValid = async (event: Event[]) => {
    const returnVal: Event[] = [];
    const did = await getDid();
    for (const el of event) {
      const json = Buffer.from(el.jwt, "base64").toString();
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
      if (el.latitude === 0 || el.latitude === null) {
        el.latitude = undefined;
      }
      if (el.longitude === 0 || el.longitude === null) {
        el.longitude = undefined;
      }
      console.log(didFromJwt, address?.toLowerCase());
      if (
        didFromJwt ===
        did &&
        result?.payload &&
        result.payload.timestamp === el.timestamp &&
        result.payload.event === el.event &&
        result.payload.recipient === el.recipient
      ) {
        console.log(result, el.event);
        returnVal.push(el);
      }
    }
    return returnVal;
  };

  const checkParticipants = async () => {
    const data = await compose.executeQuery<{
      ethDenverAttendanceCount: number;
    }>(`
        query Count{
          ethDenverAttendanceCount
        }
      `);
    console.log(data);
    const data2 = await compose.executeQuery<{
      ethDenverAttendanceIndex: {
        edges: {
          node: Event;
        }[];
      };
    }>(`
          query {
            ethDenverAttendanceIndex(last: ${data.data?.ethDenverAttendanceCount}) {
              edges {
                node {
                  id
                  recipient
                  latitude
                  longitude
                  timestamp
                  jwt
                  event
                }
              }
            }
          }
        `);
    const results = data2.data?.ethDenverAttendanceIndex.edges;
    //ensure a unique list of [recipient, event] pairs
    if (results) {
      const final = await checkValid(results.map((el) => el.node));
      const unique = Array.from(
        new Set(
          final.map((el) => {
            return JSON.stringify([el.recipient, el.event]);
          }),
        ),
      ).map((el) => {
        return JSON.parse(el) as [address: string, event: string];
      });
      console.log(unique);
      //count the number of participants who have completed each event based on the unique list
      const countObj = unique.reduce(
        (acc, [address, event]) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          acc[event as keyof typeof acc] = acc[event as keyof typeof acc]
            ? acc[event as keyof typeof acc] + 1
            : 1;
          return acc;
        },
        {} as typeof countObject,
      );

      //count the total number of unique participants based on the unique list
      const participantCount = unique.reduce((acc, [address, event]) => {
        return acc.add(address);
      }, new Set<string>()).size;
      console.log(countObj);
      const arr = Object.keys(countObj).map(function (key) {
        return countObj[key as keyof typeof countObj];
      });
      const maximum = Math.max(...arr);
      setMax(maximum);
      setParticipantCount(participantCount);
      setCount(countObj);
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
                    className="m-2 mt-4 min-h-48 w-auto max-w-full shrink-0  bg-gray-900 shadow-lg shadow-rose-600/40"
                    key={badge}
                  >
                    <div className="flex w-20 flex-col content-start items-start justify-evenly">
                      <p className="m-auto text-center font-semibold text-orange-500">
                        {badgeNames[badge as keyof typeof badgeNames]}
                      </p>
                      <Image
                        src={imageMapping[badge as keyof typeof imageMapping]}
                        alt={badge}
                        width={80}
                        height={80}
                      />
                    </div>
                    {count[badge as keyof typeof countObject] ? (
                      <div className="mt-7 flex w-full flex-row items-center justify-start">
                        <div className="flex w-full flex-col items-center justify-start">
                          <div className="flex w-full flex-row items-center justify-start">
                            <div
                              className="h-1 w-full rounded-md border-2 bg-slate-300"
                              style={{
                                width: `${(count[badge as keyof typeof countObject] /
                                    max) *
                                  100
                                  }%`,
                                height: "2rem",
                              }}
                            ></div>
                          </div>
                          <p className="text-center text-slate-200">
                            {count[badge as keyof typeof countObject]} /{" "}
                            {participantCount} Participants have Claimed
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-7 flex w-full flex-row items-center justify-start">
                        <div className="flex w-full flex-col items-center justify-start">
                          <div className="flex w-full flex-row items-center justify-start">
                            <div
                              className="h-1 w-full rounded-md border-2"
                              style={{
                                width: `100%`,
                                height: "2rem",
                              }}
                            ></div>
                          </div>
                          <p className="text-center text-gray-800">
                            0 / {participantCount} Participants have Claimed
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })
          ) : (
            <div className="m-auto flex w-full flex-col items-center justify-center">
              <DNA height={100} width={100} />
              <p className="text-center text-gray-800">Loading Event Data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
