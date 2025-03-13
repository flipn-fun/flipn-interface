import { useEffect, useRef, useState } from "react";
import { Connection } from "@solana/web3.js";
import { RPC_COLORS } from "@/app/config/rpc";
import { useSetting } from "@/app/store/use-setting";

export default function usePing(rpc: any, isDefault?: boolean) {
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<any>();
  const rpcStore: any = useSetting();
  const timerRef = useRef<any>();

  useEffect(() => {
    if (!rpc?.url) return;
    const ping = async () => {
      const connection = new Connection(rpc.url);
      const start = performance.now();
      try {
        setLoading(true);
        await connection.getVersion();
        const end = performance.now();
        const time = Math.ceil(end - start);
        const status = time < 1000 ? 0 : 1;
        setInfo({
          time: `${time} ms`,
          status,
          color: RPC_COLORS[status]
        });
        if (isDefault) {
          rpcStore.set({
            showRpcErrorModal: false
          });
        }
      } catch (error) {
        setInfo({
          time: "off",
          status: 2,
          color: RPC_COLORS[2]
        });
        if (isDefault) {
          rpcStore.set({
            showRpcErrorModal: true
          });
        }
      } finally {
        setLoading(false);
        timerRef.current = setTimeout(() => {
          ping();
        }, 10000);
      }
    };

    ping();

    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  return { info, loading };
}
