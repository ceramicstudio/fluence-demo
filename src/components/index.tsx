import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { useComposeDB } from "@/fragments";
import { DNA } from "react-loader-spinner";
import { DID, DagJWS } from "dids";
import KeyResolver from "key-did-resolver";

type Location = {
  latitude: number | undefined;
  longitude: number | undefined;
};

interface Event {
  recipient: string;
  latitude?: number;
  longitude?: number;
  verified?: boolean;
  timestamp: string;
  jwt: string;
}

type OpenDataDay = Event;
type FluenceBooth = Event;
type DePinDay = Event;
type DeSciDay = Event;
type TalentDaoHackerHouse = Event;
type ProofOfData = Event;

export default function Attest() {
  const [attesting, setAttesting] = useState(false);
  const [share, setShare] = useState(false);
  const { compose } = useComposeDB();
  const [event, setEvent] = useState<
    | "OpenDataDay"
    | "FluenceBooth"
    | "DePinDay"
    | "DeSciDay"
    | "TalentDaoHackerHouse"
    | "ProofOfData"
  >();
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

  const getParams = async () => {
    // const queryString = window.location.search;
    // const urlParams = new URLSearchParams(queryString);
    // const eventItem = urlParams.get("event")?.split("?")[0];
    // const code = urlParams.get("event")?.split("?")[1]?.replace("code=", "");
    // console.log(code);
    const eventItem = localStorage.getItem("event");
    const code = localStorage.getItem("code");
    if (code) {
      setCode(code);
    }
    eventItem ===
    "kjzl6hvfrbw6ca1mo91fjq8b6lnaiaxcken0m2u1u0mcyzuqjoqtnsuwx7pvpcn"
      ? setEvent("OpenDataDay")
      : eventItem ===
          "kjzl6hvfrbw6caoti0p0qqwno5g4c2smre0yt80qd7yw6lo7e8oakpnvayasar6"
        ? setEvent("FluenceBooth")
        : eventItem ===
            "kjzl6hvfrbw6c5s0zpztma60fy644djyq4t0geqcccx2fmvknz4kawekqbl1cbu"
          ? setEvent("DePinDay")
          : eventItem ===
              "kjzl6hvfrbw6ca5gzh227gpie4d4onygn5nq07pl2ujin6jcl3l11h7mmwegmvo"
            ? setEvent("DeSciDay")
            : eventItem ===
                "kjzl6hvfrbw6c8do6890w3noosqnbm1iegxe56rwj7mnptandeewvftm65smfqe"
              ? setEvent("TalentDaoHackerHouse")
              : eventItem ===
                  "kjzl6hvfrbw6c52wdbq2nujtgwizhjkkuuv36t0wlqvd2l8ohgf9e11gfs58qe3"
                ? setEvent("ProofOfData")
                : null;

    const data = await compose.executeQuery<{
      node: {
        openDataDay: OpenDataDay | null;
        fluenceBooth: FluenceBooth | null;
        dePinDay: DePinDay | null;
        deSciDay: DeSciDay | null;
        talentDaoHackerHouse: TalentDaoHackerHouse | null;
        proofOfData: ProofOfData | null;
      };
    }>(`
        query {
          node(id: "${`did:pkh:eip155:${chainId}:${address?.toLowerCase()}`}") {
          ... on CeramicAccount {
              openDataDay {
                id
                recipient
                latitude
                longitude
                timestamp
                jwt
                }
              fluenceBooth {
                id
                recipient
                latitude
                longitude
                timestamp
                jwt
              }
              dePinDay {
                id
                recipient
                latitude
                longitude
                timestamp
                jwt
              }
              deSciDay {
                id
                recipient
                latitude
                longitude
                timestamp
                jwt
              }
              talentDaoHackerHouse {
                id
                recipient
                latitude
                longitude
                timestamp
                jwt
              }
              proofOfData {
                id
                recipient
                latitude
                longitude
                timestamp
                jwt
              }
            }
          }
        }
      `);
    console.log(data);
    if (
      data as {
        data: {
          node: {
            openDataDay: Event | null;
            fluenceBooth: Event | null;
            dePinDay: Event | null;
            deSciDay: Event | null;
            talentDaoHackerHouse: Event | null;
            proofOfData: Event | null;
          };
        };
      }
    ) {
      if (data.data) {
        for (const key in data.data.node) {
          const event: Event | null =
            data.data.node[key as keyof typeof data.data.node];
          if (event !== null) {
            try {
              const json = Buffer.from(event.jwt, "base64").toString();
              const parsed = JSON.parse(json) as { jws: DagJWS };
              console.log(parsed);
              const newDid = new DID({ resolver: KeyResolver.getResolver() });
              const result = await newDid.verifyJWS(parsed.jws);
              const didFromJwt = result.didResolutionResult.didDocument?.id;
              console.log("This is the payload: ", didFromJwt);
              if (
                didFromJwt ===
                "did:key:z6MkqusKQfvJm7CPiSRkPsGkdrVhTy8EVcQ65uB5H2wWzMMQ"
              ) {
                event.verified = true;
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
        setOpenDataBadge(data.data.node.openDataDay);
        setFluenceBadge(data.data.node.fluenceBooth);
        setDePinBadge(data.data.node.dePinDay);
        setDeSciBadge(data.data.node.deSciDay);
        setTalentBadge(data.data.node.talentDaoHackerHouse);
        setProofBadge(data.data.node.proofOfData);
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
      create${event}(input: {
        content: {
          recipient: "${finalClaim.recipient}"
          latitude: ${finalClaim.latitude ?? 0}
          longitude: ${finalClaim.longitude ?? 0}
          timestamp: "${finalClaim.timestamp}"
          jwt: "${finalClaim.jwt}"
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
        }
      }
    }
  `);
    setAttesting(false);
    await getParams();
    return data;
  };

  const createClaim = async () => {
    const finalClaim = await createBadge();
    console.log(finalClaim);
  };

  const updateTime = async () => {
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
    void getParams();
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
          <div className="mt-6 flex justify-center">
            {!attesting ? (
              <button
                className="w-1/2 transform rounded-md bg-indigo-700 px-4 py-2 text-sm text-white transition-colors duration-200 hover:bg-indigo-600 focus:bg-indigo-600 focus:outline-none"
                onClick={async (e) => {
                  e.preventDefault();
                  await createClaim();
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
