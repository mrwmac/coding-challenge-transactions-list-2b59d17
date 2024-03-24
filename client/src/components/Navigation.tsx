import React, { useCallback, useState } from "react";
import Onboard, { WalletState } from "@web3-onboard/core";
/*
 * Task 2- Wallet Connection
 * To allow the any browser injected wallets the injected wallets package seemed appropriate.
 * I restricted it down to Metamask as this seemed to be the specific goal of the task.
 * I could have included the MetaMask SDK to allow QR codes .e.g. for installed or hardware wallets
 *  ... if this task was intended for production.  I could also
 *  have made the list of available wallets more permissive if I believed this was intended for
 *  relaase but as a local or contained task it seemed more efficient to just expedite development with a 
 * this simple solution. [The code also checks to see if the wallet is Metamask]
 */
import injectedModule from "@web3-onboard/injected-wallets";

import SendTransaction from "./SendTransaction";

//Task 2: just get the wallet, could do a test for MetaMask here and fail early
//TODO fail early test
const injectedWallet = injectedModule();

const onboard = Onboard({
  wallets: [injectedWallet],
  chains: [
    {
      id: "123456",
      token: "ETH",
      label: "Local Ganache",
      rpcUrl: "http://localhost:8545",
    },
  ],
});

const Navigation: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>();

  const handleConnect = useCallback(async () => {
    const wallets = await onboard.connectWallet();

    const [metamaskWallet] = wallets;

    if (
      metamaskWallet.label === "MetaMask" &&
      metamaskWallet.accounts[0].address
    ) {
      setWallet(metamaskWallet);
    }
  }, []);

  /**
   * Task 6 - UI: crude version of the styling issues is to remove the hidden class 
   * on the button container so that that the connect button is able to wrap
   * underneath transaction and go full width.
   * Also specified that in small screens Transaction List heading would 
   * Center and put a little margin below to give it some space. So the thwo are stacked
   * Medium screen the two items split to their respective ends of the nav
   * 
   */
  return (
    <header className="flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-ful text-sm py-4 bg-gray-800">
      <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center justify-center  md:justify-between xl:justify-between sm:mb-px">
          <a
            className="flex-none text-xl font-semibold dark:text-white"
            href="."
          >
            Transactions List
          </a>
        </div>
        <div className="hs-collapse overflow-hidden transition-all duration-300 basis-full grow sm:block">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:pl-5">
            {wallet && (
              <>
                <SendTransaction />
                <p className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-gray-200 text-sm">
                  {wallet.accounts[0].address}
                </p>
              </>
            )}
            {!wallet && (
              <button
                type="button"
                onClick={handleConnect}
                className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-gray-200 font-semibold text-gray-200 hover:text-white hover:bg-gray-500 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all text-sm"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
