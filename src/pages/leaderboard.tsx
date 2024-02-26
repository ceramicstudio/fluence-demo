import Head from "next/head";
import { useEffect, useState } from "react";
import Navbar from "@/components/nav";
import { useAccount } from "wagmi";
import Leader from "@/components/leader";
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
        <title>Leaderboard | EthDenver &apos;24 Scavenger Hunt</title>
        <meta name="description" content="Leaderboard for the EthDenver '24 Scavenger Hunt" />
        <link rel="icon" type="image/jpg" href="/favicon.ico" />
        <meta property="og:image" content="/og.png" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Leaderboard | EthDenver '24 Scavenger Hunt" />
        <meta property="og:description" content="Leaderboard for the EthDenver '24 Scavenger Hunt." />
        <meta name="twitter:image" content="/og.png" />
      </Head>
      <Navbar />

      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 bg-[url('/bg.png')]">
        {loggedIn && (
          <h1 className="mt-6 text-center text-lg font-extrabold tracking-tight text-white sm:text-2xl md:text-5xl">
            {/* Connected with{" "}
            <span className="text-[hsl(280,100%,70%)]">
              {" "}
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span> */}
          </h1>
        )}
        <div className="flex min-h-screen min-w-full flex-col items-center justify-start">
           <Leader />
          {loggedIn && <Modal />}
        </div>
      </div>
    </>
  );
}
