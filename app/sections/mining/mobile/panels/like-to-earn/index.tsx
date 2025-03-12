import styles from "../index.module.css";
import { WalletModalButton } from "@/app/libs/solana/wallet-adapter/modal";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import InfoIcon from "../info-icon";
import Popover, {
  PopoverPlacement,
  PopoverTrigger
} from "@/app/components/popover";
import { useUserAgent } from "@/app/context/user-agent";

export default function LikeToEarn({ info, userInfo }: any) {
  const router = useRouter();
  const { isMobile } = useUserAgent();
  const remainingNum = useMemo(
    () => userInfo?.like_num - userInfo?.using_like_num,
    [userInfo]
  );
  return (
    <div
      className={styles.Item}
      style={{
        border: "1px solid #FFA8E8"
      }}
    >
      <div
        className={styles.ItemBg}
        style={{
          background:
            "radial-gradient(74.25% 66.17% at 63.1% 125%, #AB2840 0%, #0C0106 100%)"
        }}
      />
      <div className={styles.ItemContent}>
        <div className={styles.ItemHeader}>
          <div className={styles.ItemTitle}>
            <span>Like to Earn</span>
            <Popover
              content={
                <div className={styles.Tips}>
                  <div>
                    Like Genesis videos to earn MEMETICS. The better memes =
                    content you interact with, the more you earn for the next
                    Like.
                  </div>

                  <div style={{ marginTop: 10 }}>
                    Read{" "}
                    <a
                      href="https://docs.flipn.fun/reward-mechanisms/trade-to-earn"
                      className={styles.LinkButton}
                    >
                      docs
                    </a>{" "}
                    for more details.
                  </div>
                </div>
              }
              trigger={isMobile ? PopoverTrigger.Click : PopoverTrigger.Hover}
              placement={PopoverPlacement.Top}
              closeDelayDuration={0}
            >
              <InfoIcon />
            </Popover>
          </div>
        </div>
        <div className={styles.ItemDesc}>
          {info?.like_num || 100} likes per day
        </div>
        <div className={styles.ItemBottom}>
          <div>{isNaN(remainingNum) ? 100 : remainingNum} left today</div>
          <div className={styles.ItemBottomButtons}>
            {userInfo?.address ? (
              <button
                type="button"
                className={styles.Button}
                disabled={remainingNum === 0}
                onClick={() => {
                  router.push("/");
                }}
              >
                View Memes
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
