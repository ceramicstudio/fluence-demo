import Head from "next/head";
import { useEffect, useState } from "react";
import Navbar from "@/components/nav";
import { useAccount } from "wagmi";
import Attest from "@/components";

export default function Home() {
  const { address } = useAccount();
  const [loggedIn, setLoggedIn] = useState(false);

  const getParams = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const eventItem = urlParams.get("event")?.split("?")[0];
    const code = urlParams.get("event")?.split("?")[1]?.replace("code=", "");
    if (eventItem && code) {
      localStorage.setItem("event", eventItem);
      localStorage.setItem("code", code);
    }
  }

  useEffect(() => {
    void getParams();
    if (address) {
      setLoggedIn(true);
    } else {
      localStorage.removeItem("did");
    }
  }, [address]);

  return (
    <>
      <Head>
        <title>EthDenver24 Scavenger Hunt</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />

        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
          {loggedIn && (
            <h1 className="text-lg font-extrabold tracking-tight text-white sm:text-2xl md:text-5xl text-center mt-6">
              Connected with{" "}
              <span className="text-[hsl(280,100%,70%)]">
                {" "}
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            </h1>
          )}
          <div className="flex flex-col items-center justify-start min-w-full min-h-screen">
            {loggedIn && <Attest />}
          </div>
        </div>
   
    </>
  );
}
