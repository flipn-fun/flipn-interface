import { useMemo } from "react";
import styles from "./index.module.css";
import Image from "next/image";
import { getVideoExt } from "@/app/components/upload";
import VideoPlayer from "@/app/components/video";
import { isVideoFile } from "@/app/utils/common";
import clsx from "clsx";
import LastKing from "./last-king";
import BlueChipBg from "./blue-chip-bg";
import BlueChipIcon from "./blue-chip-icon";
import useGoFund from "@/app/hooks/useGoFund";
import Big from "big.js";

export default function TokenIcon({
  token,
  onClick = () => {},
  className,
  isPlayButton,
  style,
  showBlueChip = false,
  showRanking = true
}: any) {
  const { progress: gofundProgress } = useGoFund({ token });

  const progress = useMemo(() => {
    if (token.status === 3) return 0;
    if (token.status === 0) {
      return (token.like / 100) * 138.23;
    }

    if (token.DApp === 'gofund') {
      return (gofundProgress / 100) * 138.23;
    }

    if (token.DApp?.includes('ray_launchpad')) {
      const rayProgress = Number(token.read_base) > 0 ? new Big(token.read_base).div(Number(token.total_base_sell) || '800000000000000').mul(100).toNumber() : 0
      return (Math.min(rayProgress, 100) / 100) * 138.23;
    }

    if (token.DApp?.includes('meteora')) {
      const meteoraProgress = Number(token.read_quote) > 0 ? new Big(token.read_quote).div(Number(token.total_base_sell) || (43 * (10 ** 9))).mul(100).toNumber() : 0
      return (Math.min(meteoraProgress, 100) / 100) * 138.23;
    }

    return (token.bondingProgress / 100) * 138.23;
  }, [token, gofundProgress]);
  return (
    <div
      className={clsx(styles.Container, className, "button")}
      onClick={onClick}
      style={{
        ...style
      }}
      id="home-action-details"
    >
      {token.data_type === "top_project" && showBlueChip && (
        <>
          <BlueChipBg className={styles.BlueChipBg} />
          <BlueChipIcon className={styles.BlueChipIcon} />
        </>
      )}

      <div
        className={styles.Content}
        style={{
          width: token.status === 3 ? 44 : 50,
          height: token.status === 3 ? 44 : 50,
          backgroundColor: token.status === 3 ? "#fff" : "#00000099"
        }}
      >
        {!!progress && (
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            className={styles.Progress}
          >
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke={token.status === 0 ? "#FF2681" : "#C9FF5D"}
              strokeWidth="2"
              strokeDasharray={`${progress}, 138.23`}
              strokeLinecap="round"
              transform="rotate(-90 24 24)"
            />
          </svg>
        )}
        {isVideoFile(token?.icon) ? (
          <VideoPlayer
            key={token.icon}
            id={token.id}
            src={token.icon}
            type={getVideoExt(token.icon)}
            className={styles.Icon}
            token={token}
            mediaId={token.id}
            style={{
              borderRadius: 20
            }}
          />
        ) : (
          <div className={styles.IconImgContainer}>
            <img
              src={token?.icon || "/img/token-placeholder.png"}
              className={styles.Icon}
              loading="lazy"
            />
            {isPlayButton && isVideoFile(token?.video) && (
              <div className={styles.IconImgPlay}>
                <img
                  src="/img/icon-play.svg"
                  alt=""
                  className={styles.IconImgPlayButton}
                />
              </div>
            )}
          </div>
        )}
        {showRanking &&
          (token.ranking <= 3 && token.ranking !== 0 ? (
            <div className={styles.King}>
              👑
              <Image
                className={styles.KingAnimation}
                src="/img/animation-king.gif"
                width={20}
                height={20}
                alt="King Animation"
              />
            </div>
          ) : token.is_king ? (
            <LastKing className={styles.LastKing} id={token.id} />
          ) : null)}
      </div>
    </div>
  );
}
