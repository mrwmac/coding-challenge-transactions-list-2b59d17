import { takeEvery } from "redux-saga/effects";
import {
  JsonRpcProvider,
  Transaction,
  TransactionResponse,
  TransactionReceipt,
  BrowserProvider,
  Signer,
  parseUnits
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
/**
 * Task 5 - Wire in the form added data. For thi sproject not so worries about accounting for different types
 * of trnsaction.
 * @param action: any
 * 
 * Task 7 - Human Readable Values: Converted form data now expected in ETH so 
 * adapted the amount to convert from ETH to A BigInt using Ether.js
 */
import { navigate } from "../components/NaiveRouter";

function* sendTransaction(action: any) {
  const provider = new JsonRpcProvider("http://localhost:8545");

  const walletProvider = new BrowserProvider(window.web3.currentProvider);

  const signer: Signer = yield walletProvider.getSigner();


  let recpientAddress = action.payload['input-recipient'], 
       amount = action.payload['input-amount'];

   //could do with more comprehensive checking here really
  if(!recpientAddress)
  {
    throw new Error('No recipient address found');
  }

  if(!amount && amount !== 0)
  {
    throw new Error('No input in ETH found');
  }

  amount = parseUnits(amount, "ether");

  const transaction = {
    to: recpientAddress,
    value: amount,
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
