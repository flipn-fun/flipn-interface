import { motion } from "framer-motion";
import styles from "./index.module.css";
import Token from "../../home/laptop/token";
import useTokenDetail from "../use-token-detail";
import { useEffect, useRef } from "react";
import { useUserAgent } from "@/app/context/user-agent";
import { useSearchParams } from "next/navigation";
import BackIcon from "./back-icon";
import { TokenStatusModal } from "@/app/components/status2Alert";
import { useDetailStatus } from "@/app/store/use-detail-status";

export default function Laptop(props: any) {
  const detailStatusStore: any = useDetailStatus();
  const { innerWidth } = useUserAgent();
  const search = useSearchParams();
  const timer = useRef<any>();
  const { infoData, getDetailInfo } = useTokenDetail({
    cb: () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        getDetailInfo({ isSkipLoading: true });
      }, 3000);
    }
  });

  const searchFrom = search.get("from") || "";

  useEffect(() => {
    detailStatusStore.setToken(infoData);
  }, [infoData]);

  useEffect(() => {
    if (["memes", "tips"].includes(searchFrom)) {
      detailStatusStore.setShow("showTrade", true);
    }
  }, [searchFrom]);

  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <motion.div
      className={styles.Wrapper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className={styles.Content}>
        <div
          style={{
            transform: `translateX(${
              detailStatusStore.hasShow()
                ? "calc(50vw - 600px)"
                : "calc(50vw - 300px)"
            })`,
            width: innerWidth
          }}
        >
          <div className={styles.BackButton}>
            {["profile", "memes", "messages"].includes(
              search.get("from") || ""
            ) && (
              <BackIcon
                onClick={() => {
                  history.back();
                }}
              />
            )}
          </div>
          <Token
            token={detailStatusStore.token}
            isCurrent={true}
            onUpdate={(token: any, action: string) => {
              if (action && ["launched_like", "comments"].includes(action)) {
                detailStatusStore.setToken(JSON.parse(JSON.stringify(token)));
                return;
              }
              if (
                search.get("address")?.toLowerCase() !==
                token.address.toLowerCase()
              )
                return;
              if (action === "flip") {
                setTimeout(() => {
                  getDetailInfo();
                }, 4000);
                return;
              }
              getDetailInfo();
            }}
            opacity={1}
            showTrade={detailStatusStore.showTrade}
            tradeTab={detailStatusStore.tab}
            dataAvailable={true}
            onUpdateTradeTab={detailStatusStore.setTab}
            onOpenPanel={(panleType: string) => {
              detailStatusStore.setShow(
                panleType,
                !detailStatusStore[panleType]
              );
            }}
          />
        </div>
      </div>

      <TokenStatusModal
        status={infoData?.status}
        onClose={() => {
          getDetailInfo();
        }}
      />
    </motion.div>
  );
}
