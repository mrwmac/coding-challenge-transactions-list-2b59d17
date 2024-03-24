import { takeEvery } from "redux-saga/effects";
import {
  JsonRpcProvider,
  Transaction,
  TransactionResponse,
  TransactionReceipt,
  BrowserProvider,
  Signer,
} from "ethers";

import apolloClient from "../apollo/client";
import { Actions } from "../types";
import { SaveTransaction } from "../queries";

/*
 * Task 4 - Navigation and Routing
 * imported the Naive router. Not sure if this is to coupled now ... for this task might 
 * be ok, if we were looking to release, I might try to think of something else, stil considering it
 * It's simple as things re simple but if the project grew I'm not so sure. 
 * Might be able to extend Naive Router to better accomodate this class as it's requirements are slightly different 
 * to TransactionList e.g. the go "back button" from here could be a dead link
 */
import { navigate } from "../components/NaiveRouter";

function* sendTransaction() {
  const provider = new JsonRpcProvider("http://localhost:8545");

  const walletProvider = new BrowserProvider(window.web3.currentProvider);

  const signer: Signer = yield walletProvider.getSigner();

  const accounts: Array<{ address: string }> = yield provider.listAccounts();

  const randomAddress = () => {
    const min = 1;
    const max = 19;
    const random = Math.round(Math.random() * (max - min) + min);
    return accounts[random].address;
  };

  /*
  * Task 3 - Redux Saga: We need a BigNumber for the WEI, luckily JavaScript has
  * supported this with BigInt (no need for ethers BigNumber, though the etherum conversion)
  * functions might still be good.
  */
  const transaction = {
    to: randomAddress(),
    value: BigInt("1000000000000000000"),
  };

  try {
    const txResponse: TransactionResponse =
      yield signer.sendTransaction(transaction);
    const response: TransactionReceipt = yield txResponse.wait();

    const receipt: Transaction = yield response.getTransaction();

    const variables = {
      transaction: {
        gasLimit: (receipt.gasLimit && receipt.gasLimit.toString()) || "0",
        gasPrice: (receipt.gasPrice && receipt.gasPrice.toString()) || "0",
        to: receipt.to,
        from: receipt.from,
        value: (receipt.value && receipt.value.toString()) || "",
        data: receipt.data || null,
        chainId: (receipt.chainId && receipt.chainId.toString()) || "123456",
        hash: receipt.hash,
      },
    };

    yield apolloClient.mutate({
      mutation: SaveTransaction,
      variables,
    });

  /*
   * Task 4 - Navigation and Routing
   * I'm assuming here is the path at the end of a success ... Might be an idea to test the result
   * Maybe check compare hash or something like that to make sure things are where we expect.
   */
    navigate(`/transaction/${receipt.hash}`);


  } catch (error) {

   /* not enough but this makes me feel a bit better .. some phantom error that likely never and issue
    * mitigated against.
    */
    console.log('Error: '+error); //string? Hope so.
    navigate(`/`);
  }
}

export function* rootSaga() {
  yield takeEvery(Actions.SendTransaction, sendTransaction);
}
