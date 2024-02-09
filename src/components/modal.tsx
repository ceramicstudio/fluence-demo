import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export default function Modal() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const { address } = useAccount();

  const checkEmail = async () => {
    const result = await fetch("/api/findemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
      }),
    });
    const data = (await result.json()) as {
      rows: [
        {
          email: string;
          address: string;
        },
      ];
    };
    if (!data.rows.length) {
      setShowModal(true);
    }
  };

  const submitEmail = async () => {
    const result = await fetch("/api/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: address,
        email,
      }),
    });
    const data = (await result.json()) as {
      rows: [
        {
          email: string;
          address: string;
        },
      ];
    };
    console.log(data);
    await checkEmail();
  };

  useEffect(() => {
    if (address) {
      //delay for 1 second to allow for the account to be created
      setTimeout(() => {
        void checkEmail();
      }, 2000);
      void checkEmail();
    }
  }, [address]);

  return (
    <>
      {showModal ? (
        <>
          <div className="fixed inset-0 z-50 m-2 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <div className="relative mx-auto my-6 w-auto max-w-3xl">
              {/*content*/}
              <div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
                {/*header*/}
                <div className="border-blueGray-200 flex items-start justify-between rounded-t border-b border-solid p-5">
                  <h3 className="text-2xl font-semibold">
                    Enter an Email for Prizes
                  </h3>
                  <button
                    className="float-right ml-auto border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-5 outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                {/*body*/}
                <div className="relative flex-auto p-6">
                  <p className="text-blueGray-500 my-4 text-lg leading-relaxed">
                    We do not have an email address on file associated with your
                    account. You are free to participate in this scavenger hunt,
                    but you will not be eligible for prizes without an email
                    address.
                  </p>

                  <p className="text-blueGray-500 my-4 text-lg leading-relaxed">
                    Please enter your email address below.
                  </p>
                </div>
                <input
                  type="text"
                  className="m-3 rounded-md border-2 border-gray-300 p-2"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {/*footer*/}
                <div className="border-blueGray-200 flex items-center justify-end rounded-b border-t border-solid p-6">
                  <button
                    className="background-transparent mb-1 mr-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="mb-1 mr-1 rounded bg-emerald-500 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-emerald-600"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      void submitEmail();
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </>
      ) : null}
    </>
  );
}
