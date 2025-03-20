import {
  PublicKey,
  Connection,
  Keypair,
  VersionedTransaction,
  VersionedMessage,
  TransactionMessage,
  Transaction,
  TransactionInstruction,
  SystemProgram
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  createCloseAccountInstruction
} from "@solana/spl-token";
import { useAccount } from "./useAccount";
import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { Project } from "../type";
import { useSetting } from "../store/use-setting";
interface Params {
  tokenAddress: string | undefined;
  token: Project
}

const API_PREFIX = "https://api.jup.ag/swap/v1";
const wsol = "So11111111111111111111111111111111111111112";

export default function useJupiter({ tokenAddress, token }: Params) {
  const { connection } = useConnection();
  const { publicKey, walletProvider } = useAccount();
  const [qoute, setQoute] = useState(1);
  const settingStore: any = useSetting();

  useEffect(() => {
    if (tokenAddress) {
      fetch(`https://api.jup.ag/price/v2?vsToken=${wsol}&ids=${tokenAddress}`)
        .then((res) => res.json())
        .then((data: any) => {
          if (data[wsol] && data[tokenAddress]) {
            setQoute(
              Number(data[wsol].price) / Number(data[tokenAddress].price)
            );
          }
        });
    }
  }, [tokenAddress]);

  const getQoute = useCallback(
    async (amount: string, type: "buy" | "sell" = "buy", slip: number) => {
      if (tokenAddress) {
        const inputToken = type === "buy" ? wsol : tokenAddress;
        const outToken = type === "buy" ? tokenAddress : wsol;
        const swapInfo = await fetchSwapInfo(inputToken, outToken, amount, 0);

        return swapInfo;
      }
      return null;
    },
    [tokenAddress]
  );

  const trade = useCallback(
    async (amount: string, type: "buy" | "sell" = "buy", slip: number) => {
      if (publicKey && tokenAddress && amount) {
        const swapInfo = await getQoute(amount, type, slip);

        const swapTransaction: any =
          await fetchSwapTransaction(publicKey.toBase58(), slip, swapInfo, settingStore.jitoable);

        if (!swapTransaction) {
          return null;
        }

        const serializedTransaction = Buffer.from(swapTransaction, 'base64');
        const transaction = Transaction.from(serializedTransaction);

        if (type === 'sell') {
          const tokenAccount = await getAssociatedTokenAddress(
            new PublicKey(tokenAddress),
            publicKey,
            false
          );

          const userToken = await getAccount(
            connection,
            tokenAccount,
            undefined,
            TOKEN_PROGRAM_ID
          );

          if (Number(userToken.amount) === Number(amount)) {
            const closeTokenIns = createCloseAccountInstruction(
              tokenAccount, // token account which you want to close
              walletProvider.publicKey!, // destination
              walletProvider.publicKey!, // owner of token account
            )
            transaction.add(closeTokenIns);
          }
        }

        const hash = await walletProvider.signAndSendTransaction(
          transaction,
          {},
          {
            isVersionedTransaction: true,
            canJitoable: settingStore.jitoable
          }
        );

        console.log("hash", hash);

        return hash;
      }
    },
    [publicKey, walletProvider, settingStore]
  );

  return {
    trade,
    getQoute,
    qoute
  };
}

// Step 1: Fetch swap info
export async function fetchSwapInfo(
  inputMint: string,
  outputMint: string,
  amount: string,
  slip: number
) {
  const response = await fetch(
    `${API_PREFIX}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slip}&swapMode=ExactIn&onlyDirectRoutes=false&asLegacyTransaction=true&maxAccounts=64&minimizeSlippage=false&tokenCategoryBasedIntermediateTokens=true`
  );
  const data = await response.json();
  return {
    inAmount: data.inAmount,
    otherAmountThreshold: data.otherAmountThreshold,
    quoteResponse: data
  };
}

// Step 2: Fetch the swap transaction
export async function fetchSwapTransaction(
  userWalletPublicKey: string,
  slip: number,
  swapInfo: any,
  jitoable: boolean
): Promise<any> {
  const requestBody: any = {
    userPublicKey: userWalletPublicKey,
    wrapAndUnwrapSol: true,
    dynamicComputeUnitLimit: true,
    correctLastValidBlockHeight: true,
    asLegacyTransaction: true,
    allowOptimizedWrappedSolTokenAccount: true,
    // prioritizationFeeLamports: {
    //   jitoTipLamports: 1000000,
    //   priorityLevelWithMaxLamports: {
    //     maxLamports: 4000000,
    //     global: false,
    //     priorityLevel: "veryHigh"
    //   }
    // },
    dynamicSlippage: {
      maxBps: slip || 300
    },
    quoteResponse: swapInfo.quoteResponse
  };

  if (jitoable) {
    requestBody.prioritizationFeeLamports = {
      jitoTipLamports: 5000000,
    }
  } else {
    requestBody.prioritizationFeeLamports = {
      priorityLevelWithMaxLamports: {
        maxLamports: 4000000,
        global: false,
        priorityLevel: "veryHigh"
      }
    }
  }

  const response = await fetch(`${API_PREFIX}/swap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const { swapTransaction, lastValidBlockHeight } = await response.json();

  return swapTransaction;
}
