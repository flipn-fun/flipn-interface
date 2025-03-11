import { useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useMemo } from "react";
import { pumpFunBuy, pumpFunSell, getCoinData } from "../utils/pumpSwap";
import { useAccount } from "./useAccount";

interface Props {
  tokenAddress: string;
}

export default function usePump({ tokenAddress }: Props) {
  const { connection } = useConnection();
  const { walletProvider } = useAccount();


  const buy = useCallback(
    async (amount: number, slippageDecimal: number) => {
      const hash = await pumpFunBuy(
        tokenAddress,
        amount,
        slippageDecimal,
        connection,
        walletProvider
      );

      return hash;
    },
    [connection, walletProvider, tokenAddress]
  );

  const sell = useCallback(
    async (amount: number, slippageDecimal: number) => {
      const hash = await pumpFunSell(
        tokenAddress,
        amount,
        slippageDecimal,
        connection,
        walletProvider
      );
      return hash;
    },
    [connection, walletProvider, tokenAddress]
  );

  const estimateToken = useCallback(
    async (solIn: number, slippageDecimal: number) => {
      const { virtualSolReserves, virtualTokenReserves } = await getCoinData(tokenAddress, connection);
      const tokenOut = Math.floor(solIn  * virtualTokenReserves / virtualSolReserves)
      return tokenOut;
    },
    [tokenAddress]
  );

  const estimateSol = useCallback(
    async (tokenBalance: number, slippageDecimal: number) => {
      const { virtualSolReserves, virtualTokenReserves } = await getCoinData(tokenAddress, connection);
      const minSolOutput = Math.floor(tokenBalance! * virtualSolReserves / virtualTokenReserves);
      return minSolOutput;
    },
    [tokenAddress]
  );

  return {
    buy,
    sell,
    estimateToken,
    estimateSol
  };
}
