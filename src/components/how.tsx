export default function Events() {


  return (
    <div className="flex min-h-screen min-w-full flex-col items-center justify-start gap-6 px-4 py-8 sm:py-16 md:py-24">
      <div
        className="ring-black-600 w-full rounded-md bg-gray-900 p-2 shadow-xl shadow-rose-600/40"
        style={{ height: "fit-content", minHeight: "35rem" }}
      >
        <>
          <p className="mb-8 mt-6 text-center text-2xl text-orange-500">
            What&apos;s the EthDenver &apos;24 Scavenger Hunt?
          </p>
          <p className="mb-8 mt-6 text-center text-md text-slate-200 px-8">
            A fun and interactive way to engage with the EthDenver community and earn points for collecting event attendance badges.
            The best part - your user data (including the badges and points you earn) is stored on Ceramic, the open and decentralized data network, so you own your data and can take it with you wherever you go.
          </p>
          <p className="mb-8 mt-6 text-center text-2xl text-orange-500">
            How it Works
          </p>
          <p className="mb-8 mt-6 text-center text-md text-slate-200">
            1. Scan a disc at a qualifying event
          </p>
          <p className="mb-8 mt-6 text-center text-md text-slate-200">
            2. Connect your wallet and authenticate yourself on the Ceramic network
          </p>
          <p className="mb-8 mt-6 text-center text-md text-slate-200">
            3. Claim your badge and earn points
          </p>
          <p className="mb-8 mt-6 text-center text-md text-slate-200">
            4. Compete for prizes
          </p>
          <p className="mb-8 mt-6 text-center text-md text-slate-200 italic">
            Note: you can only claim a badge once per event
          </p>
        </>
      </div>
    </div>
  );
}
