import { useCallback, useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export default function useHolders(token: any) {
  const [total, setTotal] = useState(0);
  const { connection } = useConnection();
  const onQuery = useCallback(async () => {
    try {
      const tokenAccounts = await connection.getParsedProgramAccounts(new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), {
        "filters": [
          {
            "dataSize": 165
          },
          {
            "memcmp": {
              "offset": 0,
              "bytes": token.address
            }
          }
        ]
      });

      // @ts-ignore
      const size = tokenAccounts.filter((item) => Number(item.account.data.parsed.info.tokenAmount.amount) > 0).length;

      setTotal(size);
    } catch (err) {
      console.log("err:", err);
      setTotal(0);
    }
  }, [token]);

  useEffect(() => {
    if (token?.status === 0 || !token?.address) return;
    onQuery();
  }, [token]);

  return { total };
}
