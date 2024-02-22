import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useWalletClient } from "wagmi";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { type RuntimeCompositeDefinition } from "@composedb/types";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { definition } from "@/__generated__/definition";
import { type GetWalletClientResult } from "@wagmi/core";
import { DID } from "dids";

type ComposeDBProps = {
  children: ReactNode;
};

const CERAMIC_URL = process.env.URL ?? "https://ceramic-demo.hirenodes.io";

/**
 * Configure ceramic Client & create context.
 */
const ceramic = new CeramicClient(CERAMIC_URL);

export const compose = new ComposeClient({
  ceramic,
  definition: definition as RuntimeCompositeDefinition,
});

let isAuthenticated = false;

const Context = createContext({ compose, isAuthenticated });

export const ComposeDB = ({ children }: ComposeDBProps) => {
  function StartAuth() {
    const { data: walletClient } = useWalletClient();
    const [isAuth, setAuth] = useState(false);

    useEffect(() => {
      async function authenticate(
        walletClient: GetWalletClientResult | undefined,
      ) {
        if (walletClient) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const accountId = await getAccountId(
            walletClient,
            walletClient.account.address,
          );
          const authMethod = await EthereumWebAuth.getAuthMethod(
            walletClient,
            accountId,
          );
          // change to use specific resource
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const session = await DIDSession.get(accountId, authMethod, {
            resources: compose.resources,
          });

          await ceramic.setDID(session.did as unknown as DID);
          console.log("Auth'd:", session.did.parent);
          localStorage.setItem("did", session.did.parent);
          setAuth(true);
        }
      }
      void authenticate(walletClient);
    }, [walletClient]);

    return isAuth;
  }

  if (!isAuthenticated) {
    isAuthenticated = StartAuth();
  }

  return (
    <Context.Provider value={{ compose, isAuthenticated }}>
      {children}
    </Context.Provider>
  );
};

export const useComposeDB = () => useContext(Context);
