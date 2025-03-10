import styles from "./index.module.css";
import { useUserAgent } from "@/app/context/user-agent";
import TradeStream from "@/app/sections/smart/components/TradeStream";
import { useAccount } from "@/app/hooks/useAccount";
export default function TopTrade({ opacity, data }: any) {
  const { innerHeight, innerWidth, isMobile } = useUserAgent();
  const { address: walletAddress } = useAccount();

  const streamInfo = {
    topTraderAddress: data.address, // get from api
    isOther: walletAddress !== data.address,
    wrapperWidth: innerWidth,
    wrapperHeight: innerHeight
  };
  return (
    <div
      className={styles.Container}
      style={{
        opacity,
        height: innerHeight,
        width: innerWidth,
        borderRadius: isMobile ? 0 : 20,
        padding: isMobile ? "96px 0px 72px" : 0
      }}
    >
      <TradeStream streamInfo={streamInfo} />
    </div>
  );
}
