import styles from "./index.module.css";
import CircleLoading from "../../icons/loading";
import usePing from "../use-ping";
import { useSetting } from "@/app/store/use-setting";

export default function Status({ rpc, showLabel = false, isDefault }: any) {
  const defaultRpc = useSetting((store: any) => store.rpc);
  const { loading, info } = usePing(rpc || defaultRpc, isDefault);
  return info ? (
    <div className={styles.Container}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="6"
        height="6"
        viewBox="0 0 6 6"
        fill="none"
      >
        <circle cx="3" cy="3" r="3" fill={info.color} />
      </svg>
      {showLabel && (
        <div className={styles.Label} style={{ color: info.color }}>
          {info.time}
        </div>
      )}
    </div>
  ) : loading ? (
    <CircleLoading size={12} />
  ) : (
    "-"
  );
}
