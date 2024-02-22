import { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount, useChainId } from "wagmi";
import { useComposeDB } from "@/fragments";
import { DNA } from "react-loader-spinner";
import { DID, type DagJWS } from "dids";
import KeyResolver from "key-did-resolver";

type Location = {
  latitude: number | undefined;
  longitude: number | undefined;
};

type ObjectType = {
  OpenDataDay: string;
  FluenceBooth: string;
  DePinDay: string;
  DeSciDay: string;
  TalentDaoHackerHouse: string;
  ProofOfData: string;
  Aspecta: string;
};

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
  DePinDay: "DePin Day",
  DeSciDay: "DeSci Day",
  TalentDaoHackerHouse: "TalentDao Hacker House",
  ProofOfData: "Proof of Data",
  AllBadges: "All Badges Threshhold",
  ThreeBadges: "Three Badges Threshhold",
  Aspecta: "Aspecta",
};

const imageMapping = {
  OpenDataDay: "/opendata.png",
  FluenceBooth: "/fluence.png",
  DePinDay: "/depin.png",
  DeSciDay: "/desci.png",
  TalentDaoHackerHouse: "/talentdao.png",
  ProofOfData: "/proofdata.png",
  AllBadges: "/all.png",
  ThreeBadges: "/final.png",
  Aspecta: "/aspecta.png",
};

export default function Attest() {
  const [attesting, setAttesting] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [share, setShare] = useState(false);
  const { compose } = useComposeDB();
  const [event, setEvent] = useState<EventString>();
  const [code, setCode] = useState<string | undefined>(undefined);
  const [badgeArray, setBadgeArray] = useState<Event[] | undefined>();
  const [pointSum, setPointSum] = useState<number>();
  const [userLocation, setUserLocation] = useState<Location>({
    latitude: undefined,
    longitude: undefined,
  });
  const [time, setTime] = useState<Date>();
  const { address } = useAccount();
  const chainId = useChainId();

  const findEvent = async () => {
    const code = localStorage.getItem("code");
    if (code) {
      setCode(code);
    }
    const result = await fetch("/api/find", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
      }),
    });
    const data = (await result.json()) as EventString | { err: string };
    console.log(data);
    if (typeof data === "string") {
      setEvent(data);
      await createEligibility(data);
    }
    await getRecords();
  };

  const updateTime = () => {
    //update time every second
    try {
      setInterval(() => {
        setTime(new Date());
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  };

  const getUserLocation = () => {
    // if geolocation is supported by the users browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }

    function success(position: GeolocationPosition) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setUserLocation({ latitude, longitude });
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
      console.log(typeof latitude);
    }

    function error() {
      console.log("Unable to retrieve your location");
    }
  };

  const issuePoint = async (value: number, context: string, refId?: string) => {
    const result = await fetch("/api/issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
        value,
        context,
        chainId,
        refId: refId ?? "",
      }),
    });
    type returnType = {
      err?: unknown;
      id: string;
      issuer: {
        id: string;
      };
      recipient: {
        id: string;
      };
      data: {
        value: number;
        timestamp: string;
        context: string;
        refId: string;
      }[];
    };
    const finalPoint = (await result.json()) as returnType;
    if (finalPoint.err) {
      alert(finalPoint.err);
      return;
    }
    console.log(finalPoint, 'success issuing point');
    return finalPoint;
  }

  const createEligibility = async (e: string) => {
    const data = await compose.executeQuery<{
      node: {
        ethDenverAttendanceList: {
          edges: {
            node: Event;
          }[];
        };
      };
    }>(`
        query {
          node(id: "${`did:pkh:eip155:${chainId}:${address?.toLowerCase()}`}") {
          ... on CeramicAccount {
             ethDenverAttendanceList(filters: { where: { event: { equalTo: "${e}" } } }, first: 1) {
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
          }
        }
      `);
    if (
      data.data &&
      data.data.node.ethDenverAttendanceList.edges.length === 0
    ) {
      setEligible(true);
    }
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

  const getPoints = async () => {
    try {
      const did = await getDid();
      const exists = await compose.executeQuery<{
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
        node(id: "${did}") {
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

      console.log(exists, 'point attestation');
      if (exists.data?.node.pointAttestationsList.edges.length) {
        const data = exists.data?.node.pointAttestationsList.edges[0]?.node.data ?? undefined;
        const sumValues = data?.reduce((acc, curr) => acc + curr.value, 0);
        setPointSum(sumValues ?? 0);
      }
    } catch (e) {
      console.log(e);
    }
  }

  const getRecords = async () => {
    await getPoints();
    const data = await compose.executeQuery<{
      node: {
        ethDenverAttendanceList: {
          edges: {
            node: Event;
          }[];
        };
      };
    }>(`
        query {
          node(id: "${`did:pkh:eip155:${chainId}:${address?.toLowerCase()}`}") {
          ... on CeramicAccount {
             ethDenverAttendanceList(first: 20) {
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
          }
        }
      `);
    console.log(data);
    const keepTrack = new Set();
    const tempArray = [];
    const sharedObj: ObjectType = {
      OpenDataDay: "",
      FluenceBooth: "",
      DePinDay: "",
      DeSciDay: "",
      TalentDaoHackerHouse: "",
      ProofOfData: "",
      Aspecta: "",
    };
    if (
      data.data &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (data.data as any).node.ethDenverAttendanceList !== null
    ) {
      for (const el of data.data.node.ethDenverAttendanceList.edges) {
        const event = el.node;
        try {
          const json = Buffer.from(event.jwt, "base64").toString();
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
          if (event.latitude === 0 || event.latitude === null) {
            event.latitude = undefined;
          }
          if (event.longitude === 0 || event.longitude === null) {
            event.longitude = undefined;
          }
          const did = await getDid();
          if (
            didFromJwt ===
            did &&
            result?.payload &&
            result.payload.timestamp === event.timestamp &&
            result.payload.event === event.event &&
            result.payload.recipient === address?.toLowerCase()
          ) {
            event.verified = true;
            keepTrack.add(event.event);
            tempArray.push(event);
            event.event === "OpenDataDay"
              ? (sharedObj.OpenDataDay = event.id)
              : event.event === "FluenceBooth"
                ? (sharedObj.FluenceBooth = event.id)
                : event.event === "DePinDay"
                  ? (sharedObj.DePinDay = event.id)
                  : event.event === "DeSciDay"
                    ? (sharedObj.DeSciDay = event.id)
                    : event.event === "TalentDaoHackerHouse"
                      ? (sharedObj.TalentDaoHackerHouse = event.id)
                      : event.event === "ProofOfData"
                        ? (sharedObj.ProofOfData = event.id)
                        : event.event === "Aspecta"
                          ? (sharedObj.Aspecta = event.id)
                          : null;
          }
        } catch (e) {
          console.log(e);
        }
      }
      // console.log(keepTrack.size);
      if (keepTrack.size === 3 || keepTrack.size === 8) {
        console.log(keepTrack);
        console.log("All badges have been collected");
        const itemToPush = await createFinal(sharedObj, keepTrack.size);
        itemToPush && tempArray.push(itemToPush);
      }
      //order badgeArray by timestamp
      tempArray.sort((a, b) => {
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
      console.log(tempArray);
      setBadgeArray(tempArray);
    }
  };

  const createBadge = async () => {
    if (!code) {
      alert("No unique code provided");
      return;
    }
    if (!event) {
      alert("No event detected");
      return;
    }
    setAttesting(true);
    const result = await fetch("/api/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: address,
        event,
        location: userLocation,
        code,
      }),
    });
    type returnType = {
      err?: unknown;
      recipient: string;
      latitude?: number;
      longitude?: number;
      timestamp: string;
      jwt: string;
    };
    const finalClaim = (await result.json()) as returnType;
    console.log(finalClaim);
    if (finalClaim.err) {
      setAttesting(false);
      alert(finalClaim.err);
      return;
    }
    const data = await compose.executeQuery<{
      createEthDenverAttendance: {
        document: Event;
      };
    }>(`
    mutation{
      createEthDenverAttendance(input: {
        content: {
          recipient: "${finalClaim.recipient}"
          latitude: ${finalClaim.latitude ?? 0}
          longitude: ${finalClaim.longitude ?? 0}
          timestamp: "${finalClaim.timestamp}"
          jwt: "${finalClaim.jwt}"
          event: "${event}"
        }
      })
      {
        document{
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
  `);
    //if mutation is a success, issue a point
    if (data.data?.createEthDenverAttendance?.document) {
      const point = await issuePoint(10, "Regular Event Attendance", data.data?.createEthDenverAttendance?.document.id);
      console.log(point);
    }
    setAttesting(false);
    await getRecords();
    setEligible(false);
    return data;
  };

  const createFinal = async (
    sharedObj: ObjectType,
    size: number,
  ): Promise<Event | undefined> => {
    setAttesting(true);
    const result = await fetch("/api/final", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: address,
        OpenDataDay: sharedObj.OpenDataDay ? sharedObj.OpenDataDay : "",
        FluenceBooth: sharedObj.FluenceBooth ? sharedObj.FluenceBooth : "",
        DePinDay: sharedObj.DePinDay ? sharedObj.DePinDay : "",
        DeSciDay: sharedObj.DeSciDay ? sharedObj.DeSciDay : "",
        TalentDaoHackerHouse: sharedObj.TalentDaoHackerHouse
          ? sharedObj.TalentDaoHackerHouse
          : "",
        ProofOfData: sharedObj.ProofOfData ? sharedObj.ProofOfData : "",
        Aspecta: sharedObj.Aspecta ? sharedObj.Aspecta : "",
        event: size === 8 ? "AllBadges" : "ThreeBadges",
      }),
    });
    type returnType = {
      err?: unknown;
      recipient: string;
      jwt: string;
      OpenDataDay: string;
      FluenceBooth: string;
      DePinDay: string;
      DeSciDay: string;
      TalentDaoHackerHouse: string;
      ProofOfData: string;
      Aspecta: string;
      timestamp: string;
      event: string;
    };
    const finalClaim = (await result.json()) as returnType;
    console.log(finalClaim);
    if (finalClaim.err) {
      setAttesting(false);
      alert(finalClaim.err);
      return undefined;
    }
    const whichEvent = size === 8 ? "AllBadges" : "ThreeBadges";
    console.log(whichEvent);

    const data = await compose.executeQuery<{
      createEthDenverAttendance: {
        document: Event;
      };
    }>(`
      mutation{
        createEthDenverAttendance(input: {
          content: {
            recipient: "${finalClaim.recipient}"
            timestamp: "${finalClaim.timestamp}"
            jwt: "${finalClaim.jwt}"
            event: "${whichEvent}"
          }
        })
        {
          document{
            id
            recipient
            timestamp
            jwt
            event
          }
        }
      }
    `);
    if (data.data?.createEthDenverAttendance?.document) {
      const point = await issuePoint(25, "Threshhold Badge Received", data.data?.createEthDenverAttendance?.document.id);
      console.log(point);
    }
    await getPoints();
    console.log(data);
    return data.data?.createEthDenverAttendance?.document;
  };

  const createClaim = async () => {
    const finalClaim = await createBadge();
    console.log(finalClaim);
  };

  useEffect(() => {
    void findEvent();
    void updateTime();
  }, [address, chainId]);

  return (
    <div className="flex min-h-screen min-w-full flex-col items-center justify-start gap-6 px-4 py-8 sm:py-16 md:py-24">
      <div
        className="ring-black-600 w-3/4 rounded-md bg-slate-300 p-6 shadow-xl shadow-rose-600/40 ring-2"
        style={{ height: "fit-content", minHeight: "35rem" }}
      >
        <form className="mt-4" key={1}>
          {eligible && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800">
                  Event
                </label>
                <p className="h-8 w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  {event ? event : ""}{" "}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800">
                  Coordinates You&apos;ve Shared{" "}
                  <span className="font-light">(optional)</span>
                </label>
                {share && (
                  <p className="mb-3 text-xs font-light text-gray-800">
                    {userLocation.latitude !== undefined &&
                      `${userLocation.latitude}, ${userLocation.longitude}`}
                  </p>
                )}
                <div className="flex items-center">
                  <input
                    id="link-checkbox"
                    type="checkbox"
                    value=""
                    onChange={() => {
                      setShare(!share);
                      getUserLocation();
                    }}
                    className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                  ></input>
                  {!share ? (
                    <label className="font-small ms-2 text-sm text-gray-900 dark:text-gray-300">
                      I agree to share my location
                    </label>
                  ) : (
                    <label className="font-small ms-2 text-sm text-gray-900 dark:text-gray-300">
                      Unshare
                    </label>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800">
                  Current time
                </label>
                <p className="text-xs font-light text-gray-800">
                  {time?.toLocaleString()}
                </p>
              </div>

              <div className="mt-6 flex justify-center">
                {!attesting ? (
                  <button
                    className="w-1/2 transform rounded-md bg-indigo-700 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-indigo-600 focus:bg-indigo-600 focus:outline-none"
                    onClick={(e) => {
                      e.preventDefault();
                      void createClaim();
                    }}
                  >
                    {"Generate Badge"}
                  </button>
                ) : (
                  <DNA
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="dna-loading"
                    wrapperStyle={{}}
                    wrapperClass="dna-wrapper"
                  />
                )}
              </div>
            </>
          )}
        </form>
        {address && !badgeArray && (
          <div className="mt-6 flex flex-col justify-center">
            <p className="text-center text-2xl text-gray-800">
              Loading your badges...
            </p>
            <DNA
              visible={true}
              height="80"
              width="80"
              ariaLabel="dna-loading"
              wrapperStyle={{margin: "auto"}}
              wrapperClass="dna-wrapper"
            />
          </div>
        )
        }
        {address && badgeArray !== undefined && badgeArray.length > 0 && (
          <h2 className="mb-8 mt-6 text-center text-3xl font-semibold text-gray-800">
            Your Badges:
          </h2>
        )}
        {address && pointSum && (
          <h3 className="mb-8 mt-6 text-center text-1xl font-semibold text-gray-800">
            Points Earned: {pointSum}
          </h3>
        )}
        {address && badgeArray !== undefined && badgeArray.length === 0 && (
          <>
            <h2 className="mb-8 mt-6 text-center text-3xl font-semibold text-gray-800">
              No Badges Yet
            </h2>
            <p className="mb-8 mt-6 text-center text-2xl text-gray-800">
              Please scan a Disc to begin claiming badges
            </p>
          </>
        )}
        {!address && (
          <h2 className="mb-8 mt-6 text-center text-3xl font-semibold text-gray-800">
            Please Connect your Wallet to Begin
          </h2>
        )}
        <div className="flex-auto flex-row flex-wrap items-center justify-center">
          {badgeArray !== undefined && badgeArray.length > 0 &&
            badgeArray.map((badge, index) => {
              return (
                <div
                  className="mt-4 flex w-auto max-w-full shrink-0 flex-col items-center justify-center rounded-md p-5 shadow-lg"
                  key={badge.event}
                >
                  <p className="m-auto text-center font-semibold text-gray-800">
                    {badgeNames[badge.event as EventString]}
                  </p>
                  <Image
                    src={imageMapping[badge.event as EventString]}
                    alt={badge.event}
                    width={400}
                    height={400}
                    style={{ margin: "auto" }}
                    onClick={() => {
                      window.open(
                        `https://cerscan.com/mainnet/stream/${badge.id}`,
                        "_blank",
                      );
                    }}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
