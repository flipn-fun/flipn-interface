import styles from "../index.module.css";
import { WalletModalButton } from "@/app/libs/solana/wallet-adapter/modal";
import { useUser } from "@/app/store/useUser";
import { useConfig } from "@/app/store/useConfig";
import usePostTask from "@/app/hooks/use-post-task";
import XButton from "./x-button";
import CheckedIcon from "../checked-icon";
// import useTwitterBind from "@/app/hooks/use-twitter-bind";
import CircleLoading from "@/app/components/icons/loading";

export default function FollowX() {
  const userStore: any = useUser();
  const config = useConfig((store: any) => store.config);
  // const redirectUri = `${window.location.origin}${window.location.pathname}`;
  const { onPost, loading, posting, isDone } = usePostTask(1);
  // const { loading } = useTwitterBind({
  //   onSuccess: () => {
  //     userStore.setUserInfo({
  //       twitter_user_id: Date.now()
  //     });
  //   },
  //   redirectUri
  // });

  return (
    <div
      className={styles.Item}
      style={{
        border: "1px solid #FBCA04"
      }}
    >
      <div
        className={styles.ItemBg}
        style={{
          background:
            "radial-gradient(74.25% 66.17% at 63.1% 125%, #FBCA04 0%, #0C0106 100%)"
        }}
      />
      <div className={styles.ItemContent}>
        <div className={styles.ItemHeader}>
          <div className={styles.ItemTitle}>
            <span>Follow FlipN on X</span>
          </div>
          <div className={styles.ItemSubTitle}>
            +10 <span className={styles.ThemeColor}>$FUN</span>
          </div>
        </div>
        <div className={styles.ItemDesc}></div>
        <div className={styles.ItemBottom}>
          {userStore?.userInfo?.address ? (
            <XButton
              onClick={() => {
                window.open("https://x.com/flipndotfun", "_blank");
              }}
            />
          ) : (
            <div />
          )}
          <div className={styles.ItemBottomButtons}>
            {userStore?.userInfo?.address ? (
              <button
                type="button"
                className={styles.Button}
                disabled={posting}
                style={{ width: 104 }}
                onClick={() => {
                  if (!isDone) {
                    onPost();
                  }

                  window.open(
                    isDone
                      ? "https://twitter.com/flipndotfun"
                      : "https://twitter.com/intent/follow?screen_name=flipndotfun",
                    "_blank"
                  );
                }}
              >
                {posting ? <CircleLoading /> : isDone ? "Visit" : "Follow"}
              </button>
            ) : (
              <WalletModalButton className={styles.Button}>
                Connect
              </WalletModalButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
