import Modal from "@/app/components/modal";
import styles from "./index.module.css";
import clsx from "clsx";
import { useUserAgent } from "@/app/context/user-agent";
import useBindingInviteCode from "./use-binding";
import CircleLoading from "@/app/components/icons/loading";
import { useState } from "react";
import { fail, success } from "@/app/utils/toast";

export default function CustomizeLink({ show, onClose }: any) {
  const { isMobile } = useUserAgent();
  const [showEditModal, setShowEditModal] = useState(false);
  const { loading, onBind, code, setCode, errorMsg } = useBindingInviteCode();

  return (
    <>
      <Modal
        open={show}
        onClose={onClose}
        animation={isMobile ? "popup" : "modal"}
        forceNoCloseIcon={isMobile}
      >
        <div className={styles.ConfigContainer}>
          <div className={styles.ConfigLink}>app.flipn.fun/ref?=qwe123</div>
          <div className={styles.CofigDesc}>
            You can customize your invite link at the first time, once the URL
            has been used, it can’t be changed.
          </div>
          <div className={styles.ConfigButtons}>
            <button
              className={clsx(styles.ConfigButton, "button")}
              onClick={() => {
                setShowEditModal(true);
              }}
            >
              Customize
            </button>
            <button
              className={clsx(styles.ConfigButton, "button")}
              onClick={async () => {
                try {
                  // TODO
                  await navigator.clipboard.writeText("");
                  success("Copied successfully!");
                } catch (err) {
                  fail("Copied failed!");
                }
              }}
            >
              Copy
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
        }}
        animation={isMobile ? "popup" : "modal"}
        forceNoCloseIcon={isMobile}
      >
        <div
          className={styles.Container}
          style={{
            borderRadius: isMobile ? "20px 20px 0px 0px" : 20
          }}
        >
          <div className={styles.Header}>
            <span>Customize my invite link</span>
          </div>
          <div className={styles.InputHeader}>
            <div className={styles.BasicLink}>app.flipn.fun/ref/</div>
            <div className={styles.Amount}>{20 - code.length}</div>
          </div>
          <input
            className={`${styles.Input} ${errorMsg && styles.InputError}`}
            placeholder="Please enter your own invite link"
            value={code}
            maxLength={20}
            onChange={(ev) => {
              setCode(ev.target.value);
            }}
          />
          <div className={styles.ErrorHints}>{errorMsg}</div>
          <div className={styles.Bottom}>
            <div className={styles.Hints}>Can be customized only once</div>
            <button
              className={clsx(styles.Button, "button")}
              onClick={onBind}
              disabled={loading}
            >
              {loading ? <CircleLoading size={20} /> : "Save"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
