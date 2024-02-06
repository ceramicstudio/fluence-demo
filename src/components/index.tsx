import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { useComposeDB } from "@/fragments";
import { DNA } from "react-loader-spinner";
import { DID, DagJWS } from "dids";
import KeyResolver from "key-did-resolver";
import { set } from "zod";

type Location = {
  latitude: number | undefined;
  longitude: number | undefined;
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
}

type OpenDataDay = Event;
type FluenceBooth = Event;
type DePinDay = Event;
type DeSciDay = Event;
type TalentDaoHackerHouse = Event;
type ProofOfData = Event;

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
  const [userLocation, setUserLocation] = useState<Location>({
    latitude: undefined,
    longitude: undefined,
  });
  const [time, setTime] = useState<Date>();
  const { address } = useAccount();
  const chainId = useChainId();

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

  const findEvent = async () => {
    const code = localStorage.getItem("code");
    if (!code) {
      alert("No unique code provided");
      return;
    }
    setCode(code);
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
          console.log(parsed);
          const newDid = new DID({ resolver: KeyResolver.getResolver() });
          const result = await newDid.verifyJWS(parsed.jws);
          const didFromJwt = result.didResolutionResult.didDocument?.id;
          console.log("This is the payload: ", didFromJwt);
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
                        : null;
          }
        } catch (e) {
          console.log(e);
        }
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

  const createClaim = async () => {
    const finalClaim = await createBadge();
    console.log(finalClaim);
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

  useEffect(() => {
    void findEvent();
    void updateTime();
  }, [address, chainId]);

  return (
    <div className="flex min-h-screen min-w-full flex-col items-center justify-start gap-6 px-4 py-8 sm:py-16 md:py-24">
      <div
        className="w-full rounded-md bg-white p-6 shadow-xl shadow-rose-600/40 ring-2 ring-indigo-600"
        style={{ height: "fit-content", minHeight: "35rem" }}
      >
        <form className="mt-4" key={1}>
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
          {eligible && <div className="mt-6 flex justify-center">
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
          </div>}
        </form>
        <div className="flex-auto flex-row flex-wrap items-center justify-center">
          {openDataBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0 rounded-md border-2 border-emerald-600">
              <label className="flex px-3 py-2 text-sm font-semibold text-gray-800">
                Open Data Day Badge
              </label>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Recipient:{" "}
                {openDataBadge?.recipient.slice(0, 6) +
                  "..." +
                  openDataBadge?.recipient.slice(-4)}
              </p>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Timestamp: {openDataBadge?.timestamp}
              </p>
              {openDataBadge.latitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Latitude: {openDataBadge?.latitude}
                </p>
              )}
              {openDataBadge.longitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Longitude: {openDataBadge?.longitude}
                </p>
              )}
              {openDataBadge.verified && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Verified: {openDataBadge?.verified ? "true" : "false"}
                </p>
              )}
            </div>
          )}
          {dePinBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0 rounded-md border-2 border-emerald-600">
              <label className="flex px-3 py-2 text-sm font-semibold text-gray-800">
                DePin Badge
              </label>
              <p className="rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Recipient:{" "}
                {dePinBadge?.recipient
                  ? dePinBadge?.recipient.slice(0, 6) +
                    "..." +
                    dePinBadge?.recipient.slice(-4)
                  : ""}
              </p>
              <p className="rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Timestamp: {dePinBadge?.timestamp}
              </p>
              {dePinBadge.latitude && (
                <p className="rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Latitude: {dePinBadge?.latitude}
                </p>
              )}
              {dePinBadge.longitude && (
                <p className="rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Longitude: {dePinBadge?.longitude}
                </p>
              )}
              {dePinBadge.verified && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Verified: {dePinBadge?.verified ? "true" : "false"}
                </p>
              )}
            </div>
          )}
          {fluenceBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0 rounded-md border-2 border-emerald-600">
              <label className="flex px-3 py-2 text-sm font-semibold text-gray-800">
                Fluence Badge
              </label>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Recipient:{" "}
                {fluenceBadge?.recipient.slice(0, 6) +
                  "..." +
                  fluenceBadge?.recipient.slice(-4)}
              </p>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Timestamp: {fluenceBadge?.timestamp}
              </p>
              {fluenceBadge.latitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Latitude: {fluenceBadge?.latitude}
                </p>
              )}
              {fluenceBadge.longitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Longitude: {fluenceBadge?.longitude}
                </p>
              )}
              {fluenceBadge.verified && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Verified: {fluenceBadge?.verified ? "true" : "false"}
                </p>
              )}
            </div>
          )}
          {deSciBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0 rounded-md border-2 border-emerald-600">
              <label className="flex px-3 py-2 text-sm font-semibold text-gray-800">
                DeSci Badge
              </label>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Recipient:{" "}
                {deSciBadge?.recipient.slice(0, 6) +
                  "..." +
                  deSciBadge?.recipient.slice(-4)}
              </p>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Timestamp: {deSciBadge?.timestamp}
              </p>
              {deSciBadge.latitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Latitude: {deSciBadge?.latitude}
                </p>
              )}
              {deSciBadge.longitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Longitude: {deSciBadge?.longitude}
                </p>
              )}
              {deSciBadge.verified && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Verified: {deSciBadge?.verified ? "true" : "false"}
                </p>
              )}
            </div>
          )}
          {talentBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0 rounded-md border-2 border-emerald-600">
              <label className="flex px-3 py-2 text-sm font-semibold text-gray-800">
                TalentDAO Hacker House Badge
              </label>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Recipient:{" "}
                {talentBadge?.recipient.slice(0, 6) +
                  "..." +
                  talentBadge?.recipient.slice(-4)}
              </p>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Timestamp: {talentBadge?.timestamp}
              </p>
              {talentBadge.latitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Latitude: {talentBadge?.latitude}
                </p>
              )}
              {talentBadge.longitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Longitude: {talentBadge?.longitude}
                </p>
              )}
              {talentBadge.verified && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Verified: {talentBadge?.verified ? "true" : "false"}
                </p>
              )}
            </div>
          )}
          {proofBadge !== null && (
            <div className="mt-4 w-auto max-w-full shrink-0 rounded-md border-2 border-emerald-600">
              <label className="flex px-3 py-2 text-sm font-semibold text-gray-800">
                Proof of Data Badge
              </label>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Recipient:{" "}
                {proofBadge?.recipient.slice(0, 6) +
                  "..." +
                  proofBadge?.recipient.slice(-4)}
              </p>
              <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                Timestamp: {proofBadge?.timestamp}
              </p>
              {proofBadge.latitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Latitude: {proofBadge?.latitude}
                </p>
              )}
              {proofBadge.longitude && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Longitude: {proofBadge?.longitude}
                </p>
              )}
              {proofBadge.verified && (
                <p className="w-full rounded-md border px-3 py-2 focus:border-indigo-600 focus:outline-none">
                  Verified: {proofBadge?.verified ? "true" : "false"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
