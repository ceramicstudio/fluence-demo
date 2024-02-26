import Head from "next/head";
import { useEffect } from "react";
import Navbar from "@/components/nav";
import { useAccount } from "wagmi";
import How from "@/components/how";

export default function Home() {
  const { address } = useAccount();

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
      console.log("address", address);
    } else {
      localStorage.removeItem("did");
    }
  }, [address]);

  return (
    <>
      <Head>
        <title>How it Works | EthDenver &apos;24 Scavenger Hunt</title>
        <meta name="description" content="Learn how the EthDenver '24 Scavenger Hunt works!" />
        <link rel='icon' href='/ceramic-favicon.svg' />
        <meta property="og:image" content="/og.png" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Events | EthDenver '24 Scavenger Hunt" />
        <meta property="og:description" content="Discover where to find us at EthDenver '24." />
        <meta name="twitter:image" content="/og.png" />
      </Head>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 bg-[url('/bg.png')]">
        <div className="flex min-h-screen min-w-full flex-col items-center justify-start">
          <How />
        </div>
      </div>
    </>
  );
}
