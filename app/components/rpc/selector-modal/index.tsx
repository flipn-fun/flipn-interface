import styles from "./index.module.css";
import Modal from "../../modal";
import Status from "../status";
import { useUserAgent } from "@/app/context/user-agent";
import { useSetting } from "@/app/store/use-setting";
import { RPCS } from "@/app/config/rpc";
import clsx from "clsx";

export default function SelectorModal() {
  const { isMobile } = useUserAgent();
  const rpcStore: any = useSetting();
  return (
    <Modal
      open={rpcStore.showRpcSelectModal}
      onClose={() => {
        rpcStore.set({
          showRpcSelectModal: false
        });
      }}
      animation={isMobile ? "popup" : "modal"}
      forceNoCloseIcon={isMobile}
    >
      <div
        className={styles.Container}
        style={{
          width: isMobile ? "100vw" : 375,
          borderRadius: isMobile ? "20px 20px 0px 0px" : 20
        }}
      >
        <div className={styles.Title}>RPC Selector</div>
        <div className={styles.Desc}>
          Select the available RPC service below and the page will be
          automatically refreshed
        </div>
        <div className={styles.List}>
          {RPCS.map((rpc: any) => (
            <div
              key={rpc.name}
              className={clsx(styles.Item, "button")}
              onClick={() => {
                rpcStore.set({ rpc, showRpcSelectModal: false });
                location.reload();
              }}
            >
              <div className={styles.ItemLabel}>{rpc.name}</div>
              <div className={styles.ItemRight}>
                <Status rpc={rpc} showLabel={true} />
                <div className={styles.ItemRadio}>
                  {rpc.name === rpcStore.rpc.name && (
                    <div className={styles.ItemRadioInner} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
