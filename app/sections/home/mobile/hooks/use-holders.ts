import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getTokenMeta } from "@/app/utils/solanaScanApi";

export default function useHolders(token: any, dataAvailable?: boolean) {
  const [total, setTotal] = useState(0);
  const onQuery = useCallback(async () => {
    try {
      const tokenMeta = await getTokenMeta(token.address)
      setTotal(tokenMeta.data.holder);
    } catch (err) {
      console.log("err:", err);
      setTotal(0);
    }
  }, [token]);

  useEffect(() => {
    if (token?.status === 0 || !token?.address || dataAvailable === false)
      return;

    onQuery();
  }, [token, dataAvailable]);

  return { total };
}
