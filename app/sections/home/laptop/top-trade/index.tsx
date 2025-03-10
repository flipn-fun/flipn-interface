import styles from "./index.module.css";
import { useUserAgent } from "@/app/context/user-agent";
export default function TopTrade({ opacity, data }: any) {
  const { innerHeight, innerWidth, isMobile } = useUserAgent();

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
      Top Trade
    </div>
  );
}
