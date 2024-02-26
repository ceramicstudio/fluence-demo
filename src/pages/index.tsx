import Head from "next/head";
import { useEffect, useState } from "react";
import Navbar from "@/components/nav";
import { useAccount } from "wagmi";
import Attest from "@/components";
import Modal from "@/components/modal";

export default function Home() {
  const { address } = useAccount();
  const [loggedIn, setLoggedIn] = useState(false);

  const getParams = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const code = urlParams.get("code")?.split("?")[0];
    if (code) {
      localStorage.setItem("code", code);
    }
  };

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
        <title>EthDenver &apos;24 Scavenger Hunt</title>
        <meta name="description" content="Join the EthDenver &apos;24 Scavenger Hunt, presented by Ceramic and Fluence." />
        <link rel='icon' href='/ceramic-favicon.svg' />
        <meta property="og:image" content="/og.png" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="EthDenver '24 Scavenger Hunt" />
        <meta property="og:description" content="Join the EthDenver '24 Scavenger Hunt, presented by Ceramic and Fluence." />
        <meta name="twitter:image" content="/og.png" />
      </Head>
      <Navbar />

      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 bg-[url('/bg.png')]">
        {loggedIn && (
          <h1 className="mt-6 text-center text-lg font-extrabold tracking-tight text-white sm:text-2xl md:text-5xl">
          </h1>
        )}
        {!loggedIn && (
          <div className="flex min-h-screen min-w-full flex-col items-center justify-start gap-6 px-4 py-8 sm:py-16 md:py-24">
            <div
              className="ring-black-600 w-full rounded-md bg-gray-900 p-6 shadow-xl shadow-rose-600/40"
              style={{ height: "fit-content", minHeight: "35rem" }}
            >
              <h2 className="mb-8 mt-6 text-center text-4xl text-orange-500 margin-auto">
                Welcome to the EthDenver &apos;24 Scavenger Hunt
              </h2>
              <img src="/all.png" alt="wallet" className="w-2/3 mx-auto" />
              <h3 className="mb-8 mt-6 text-center text-1xl text-slate-200 margin-auto font-semibold">
                Please Connect your Wallet to Begin Earning Points
              </h3>
            </div>
          </div>
        )
        }
        <div className="flex min-h-screen min-w-full flex-col items-center justify-start">
          {loggedIn && <Attest />}
          {loggedIn && <Modal />}
        </div>
      </div>
    </>
  );
}
