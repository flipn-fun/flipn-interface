import RpcStatus from "@/app/components/rpc/status";
import styles from "./index.module.css";
import VoiceIcon from "@/app/components/icons/voice";
import { useSetting } from "@/app/store/use-setting";
export default function BottomActions() {
  const settingStore: any = useSetting();
  return (
    <div className={styles.Container}>
      <div
        className="button"
        onClick={() => {
          settingStore.set({
            isVoiceClose: !settingStore.isVoiceClose
          });
        }}
      >
        <VoiceIcon isClose={settingStore.isVoiceClose} />
      </div>
      <div
        onClick={() => {
          settingStore.set({
            showRpcSelectModal: true
          });
        }}
        className="button"
      >
        <RpcStatus isDefault showLabel />
      </div>
    </div>
  );
}
