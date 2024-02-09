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
};

type EventString =
  | "OpenDataDay"
  | "FluenceBooth"
  | "DePinDay"
  | "DeSciDay"
  | "TalentDaoHackerHouse"
  | "ProofOfData";

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

type OpenDataDay = Event;
type FluenceBooth = Event;
type DePinDay = Event;
type DeSciDay = Event;
type TalentDaoHackerHouse = Event;
type ProofOfData = Event;
type FinalBadge = Event;

export default function Attest() {
  const [attesting, setAttesting] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [share, setShare] = useState(false);
  const { compose } = useComposeDB();
  const [event, setEvent] = useState<EventString>();
  const [code, setCode] = useState<string | undefined>(undefined);
  const [openDataBadge, setOpenDataBadge] = useState<OpenDataDay | null>(null);
  const [fluenceBadge, setFluenceBadge] = useState<FluenceBooth | null>(null);
  const [dePinBadge, setDePinBadge] = useState<DePinDay | null>(null);
  const [deSciBadge, setDeSciBadge] = useState<DeSciDay | null>(null);
  const [talentBadge, setTalentBadge] = useState<TalentDaoHackerHouse | null>(
    null,
  );
  const [proofBadge, setProofBadge] = useState<ProofOfData | null>(null);
  const [allBadges, setAllBadges] = useState<FinalBadge | null>(null);
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

  const getRecords = async () => {
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
    const sharedObj: ObjectType = {
      OpenDataDay: "",
      FluenceBooth: "",
      DePinDay: "",
      DeSciDay: "",
      TalentDaoHackerHouse: "",
      ProofOfData: "",
    };
    if (
      data.data &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      (data.data as any).node.ethDenverAttendanceList.edges.length
    ) {
      for (const el of data.data.node.ethDenverAttendanceList.edges) {
        const event = el.node;
        try {
          const json = Buffer.from(event.jwt, "base64").toString();
          const parsed = JSON.parse(json) as { jws: DagJWS };
          const newDid = new DID({ resolver: KeyResolver.getResolver() });
          const result = await newDid.verifyJWS(parsed.jws);
          const didFromJwt = result.didResolutionResult.didDocument?.id;
          if (event.latitude === 0) {
            event.latitude = undefined;
          }
          if (event.longitude === 0) {
            event.longitude = undefined;
          }
          if (
            didFromJwt ===
            "did:key:z6MkqusKQfvJm7CPiSRkPsGkdrVhTy8EVcQ65uB5H2wWzMMQ"
          ) {
            event.verified = true;
            event.event === "OpenDataDay"
              ? setOpenDataBadge(event)
              : event.event === "FluenceBooth"
                ? setFluenceBadge(event)
                : event.event === "DePinDay"
                  ? setDePinBadge(event)
                  : event.event === "DeSciDay"
                    ? setDeSciBadge(event)
                    : event.event === "TalentDaoHackerHouse"
                      ? setTalentBadge(event)
                      : event.event === "ProofOfData"
                        ? setProofBadge(event)
                        : event.event === "AllBadges"
                          ? setAllBadges(event)
                          : null;
            keepTrack.add(event.event);
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
                        : null;
          }
        } catch (e) {
          console.log(e);
        }
      }
      if (keepTrack.size === 6) {
        console.log(keepTrack);
        console.log("All badges have been collected");
        await createFinal(sharedObj);
      }
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
    const data = await compose.executeQuery(`
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
    setAttesting(false);
    await getRecords();
    setEligible(false);
    return data;
  };

  const createFinal = async (sharedObj: ObjectType) => {
    setAttesting(true);
    const result = await fetch("/api/final", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: address,
        OpenDataDay: sharedObj.OpenDataDay,
        FluenceBooth: sharedObj.FluenceBooth,
        DePinDay: sharedObj.DePinDay,
        DeSciDay: sharedObj.DeSciDay,
        TalentDaoHackerHouse: sharedObj.TalentDaoHackerHouse,
        ProofOfData: sharedObj.ProofOfData,
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
      timestamp: string;
    };
    const finalClaim = (await result.json()) as returnType;
    console.log(finalClaim);
    if (finalClaim.err) {
      setAttesting(false);
      alert(finalClaim.err);
      return;
    }
    const data = await compose.executeQuery(`
    mutation{
      createEthDenverAttendance(input: {
        content: {
          recipient: "${finalClaim.recipient}"
          timestamp: "${finalClaim.timestamp}"
          jwt: "${finalClaim.jwt}"
          event: "AllBadges"
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
    setAttesting(false);
    // await getRecords();
    setEligible(false);
    return data;
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
        className="w-3/4 rounded-md bg-slate-300 p-6 shadow-xl shadow-rose-600/40 ring-2 ring-black-600"
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
                    {userLocation
                      ? `${userLocation.latitude}, ${userLocation.longitude}`
                      : ""}
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
        <h2 className="mb-8 mt-6 text-center text-3xl font-semibold text-gray-800">
          Your Badges:
        </h2>
        <div className="flex-auto flex-row flex-wrap items-center justify-center">
          {allBadges !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0">
              <p className="m-auto text-center font-semibold text-gray-800">
                All Badges
              </p>
              <Image
                src="/all.png"
                alt="All Badges"
                width={400}
                height={400}
                style={{ margin: "auto" }}
                onClick={() => {
                  window.open(
                    `https://cerscan.com/mainnet/stream/${allBadges.id}`,
                    "_blank",
                  );
                }}
              />
            </div>
          )}
          {openDataBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0">
              <p className="m-auto text-center font-semibold text-gray-800">
                Open Data Day Badge
              </p>
              <Image
                src="/opendata.png"
                alt="Open Data Day Badge"
                width={400}
                height={400}
                style={{ margin: "auto" }}
                onClick={() => {
                  window.open(
                    `https://cerscan.com/mainnet/stream/${openDataBadge.id}`,
                    "_blank",
                  );
                }}
              />
            </div>
          )}
          {dePinBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0">
              <p className="m-auto text-center font-semibold text-gray-800">
                DePin Badge
              </p>
              <Image
                src="/depin.png"
                alt="DePin Badge"
                width={400}
                height={400}
                style={{ margin: "auto" }}
                onClick={() => {
                  window.open(
                    `https://cerscan.com/mainnet/stream/${dePinBadge.id}`,
                    "_blank",
                  );
                }}
              />
            </div>
          )}
          {fluenceBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0">
              <p className="m-auto text-center font-semibold text-gray-800">
                Fluence Badge
              </p>
              <Image
                src="/fluence.png"
                alt="Fluence Badge"
                width={400}
                height={400}
                style={{ margin: "auto" }}
                onClick={() => {
                  window.open(
                    `https://cerscan.com/mainnet/stream/${fluenceBadge.id}`,
                    "_blank",
                  );
                }}
              />
            </div>
          )}
          {deSciBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0">
              <p className="m-auto text-center font-semibold text-gray-800">
                DeSci Badge
              </p>
              <Image
                src="/desci.png"
                alt="DeSci Badge"
                width={400}
                height={400}
                style={{ margin: "auto" }}
                onClick={() => {
                  window.open(
                    `https://cerscan.com/mainnet/stream/${deSciBadge.id}`,
                    "_blank",
                  );
                }}
              />
            </div>
          )}
          {talentBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0">
              <p className="m-auto text-center font-semibold text-gray-800">
                TalentDao Hacker House Badge
              </p>
              <Image
                src="/talentdao.png"
                alt="TalentDao Hacker House Badge"
                width={400}
                height={400}
                style={{ margin: "auto" }}
                onClick={() => {
                  window.open(
                    `https://cerscan.com/mainnet/stream/${talentBadge.id}`,
                    "_blank",
                  );
                }}
              />
            </div>
          )}
          {proofBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0">
              <p className="m-auto text-center font-semibold text-gray-800">
                Proof of Data Badge
              </p>
              <Image
                src="/proofdata.png"
                alt="Proof of Data Badge"
                width={400}
                height={400}
                style={{ margin: "auto" }}
                onClick={() => {
                  window.open(
                    `https://cerscan.com/mainnet/stream/${proofBadge.id}`,
                    "_blank",
                  );
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
