import styles from "./index.module.css";
import Modal from "../../modal";
import { useUserAgent } from "@/app/context/user-agent";
import { useSetting } from "@/app/store/use-setting";
import clsx from "clsx";

export default function ErrorModal() {
  const { isMobile } = useUserAgent();
  const rpcStore: any = useSetting();
  return (
    <Modal
      open={rpcStore.showRpcErrorModal}
      onClose={() => {
        rpcStore.set({
          showRpcErrorModal: false
        });
      }}
      forceNoCloseIcon={isMobile}
    >
      <div className={styles.Container}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="38"
          height="33"
          viewBox="0 0 38 33"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.9597 0.999999C17.7295 -0.333334 19.654 -0.333333 20.4238 1L37.1125 29.9057C37.8823 31.2391 36.9201 32.9057 35.3805 32.9057H2.00298C0.463382 32.9057 -0.498867 31.2391 0.270933 29.9057L16.9597 0.999999ZM16.9018 14.1109C16.9018 13.1222 17.7033 12.3208 18.6919 12.3208C19.6805 12.3208 20.4819 13.1222 20.4819 14.1109V21.271C20.4819 22.2596 19.6805 23.061 18.6919 23.061C17.7033 23.061 16.9018 22.2596 16.9018 21.271V14.1109ZM18.6919 24.8506C17.7033 24.8506 16.9018 25.652 16.9018 26.6406C16.9018 27.6292 17.7033 28.4307 18.6919 28.4307C19.6805 28.4307 20.4819 27.6292 20.4819 26.6406C20.4819 25.652 19.6805 24.8506 18.6919 24.8506Z"
            fill="#FF547D"
          />
        </svg>
        <div className={styles.Title}>RPC Error!</div>
        <div className={styles.Desc}>Click to switch to another node</div>
        <button
          className={clsx(styles.Button, "button")}
          onClick={() => {
            rpcStore.set({
              showRpcSelectModal: true,
              showRpcErrorModal: false
            });
          }}
        >
          Switch
        </button>
      </div>
    </Modal>
  );
}
