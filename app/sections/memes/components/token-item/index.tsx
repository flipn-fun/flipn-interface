import styles from "./index.module.css";
import clsx from "clsx";
import TokenIcon from "@/app/components/avatar/token";
import SummaryItem from "@/app/sections/memes/components/summary-item";
import {
  formatLongText,
  isVideoFile,
  numberFormatter
} from "@/app/utils/common";
import Countdown from "@/app/sections/memes/components/countdown";
import { Hot, Meme } from "@/app/sections/memes/store/list";
import { Skeleton } from "antd-mobile";
import { useUserAgent } from "@/app/context/user-agent";
import VideoPlayer from "@/app/components/video";
import { getVideoExt } from "@/app/components/upload";
import { useContext, useMemo, useState } from "react";
import Big from "big.js";
import { useRouter } from "next/navigation";
import { MemesContext } from "@/app/sections/memes/context";
import { Tab, TABS } from "@/app/sections/memes/config";

const TokenItem = (props: {
  className?: string;
  token: Hot | Meme;
  holders?: number;
  holdersLoading?: boolean;
  currentTab?: Tab;
}) => {
  const { className, token, holders = 0, holdersLoading, currentTab } = props;

  const { isMobile } = useUserAgent();
  const router = useRouter();

  const _token = useMemo(() => {
    return token.kind === "Meme"
      ? {
          ...token,
          icon: token.icon || token.video,
          bondingProgress: token.bonding_progress
        }
      : {
          ...token,
          icon: token.Icon || token.video,
          bondingProgress: token.bonding_progress
        };
  }, [token]);

  return (
    <div
      className={clsx(styles.TokenItemContainer, className)}
      onClick={() => {
        router.push(`/detail?address=${token?.address}&from=memes`);
      }}
    >
      {!isMobile && (
        <div className={styles.TokenItemLaptopAvatar}>
          {isVideoFile(_token.video) ? (
            _token.icon ? (
              <div className={styles.TokenItemLaptopAvatarBannerWithPlayButton}>
                <img
                  src={_token?.icon || "/img/token-placeholder.png"}
                  alt=""
                  className={styles.TokenItemLaptopAvatarBanner}
                  loading="lazy"
                />
                <div
                  className={
                    styles.TokenItemLaptopAvatarBannerPlayButtonContainer
                  }
                  style={{ display: "none" }}
                >
                  <img
                    src="/img/icon-play.svg"
                    alt=""
                    className={styles.TokenItemLaptopAvatarBannerPlayButton}
                  />
                </div>
              </div>
            ) : (
              <VideoPlayer
                key={_token.video}
                id={String(_token.id)}
                mediaId={`TokenItemLaptopAvatar-${_token.id}`}
                src={_token.video}
                type={getVideoExt(_token.video)}
                className={styles.TokenItemLaptopAvatarBanner}
                autoPlay={true}
                token={_token as any}
              />
            )
          ) : (
            <div className={styles.TokenItemLaptopAvatarBannerWithPlayButton}>
              <img
                src={_token?.icon || "/img/token-placeholder.png"}
                alt=""
                className={styles.TokenItemLaptopAvatarBanner}
                loading="lazy"
              />
            </div>
          )}
          <div className={styles.TokenItemLaptopAvatarProfile}>
            <div className={styles.TokenItemLaptopAvatarProfileLeft}>
              <TokenIcon
                className={styles.TokenItemLaptopAvatarCorner}
                token={{
                  ..._token,
                  is_king: false
                }}
              />
              <div
                className={styles.TokenItemLaptopAvatarProfileSymbol}
                title={_token.token_symbol}
              >
                {formatLongText(_token.token_symbol, 2, 4)}
              </div>
            </div>
            <div className={styles.TokenItemLaptopAvatarProfileRight}>
              <div className={styles.TokenItemCreateAt}>
                {token.created2Now?.split?.(" ")?.[0]}
                {token.created2Now?.split?.(" ")?.[1]?.slice?.(0, 1)}
              </div>
            </div>
          </div>
          <div
            className={styles.TokenItemLaptopAvatarCrown}
            style={
              _token?.is_king && _token.kind === "Hot"
                ? _token.ranking <= 3
                  ? {
                      right: "unset",
                      top: "-20px",
                      left: "-28px",
                      zIndex: 2,
                      transform: "rotate(0deg)"
                    }
                  : {
                      right: "-10px",
                      top: "-15px",
                      transform: "rotate(30deg)"
                    }
                : {}
            }
          >
            {(_token?.is_king && _token.kind === "Hot")
              && (
                _token.ranking > 3 ? (
                  <img
                    src="/img/memes/icon-crown.svg"
                    alt=""
                    className={styles.TokenItemLaptopAvatarCrownIcon}
                    style={{ display: "none" }}
                  />
                ) : (
                  <img
                    src="/img/memes/icon-crown-laptop.svg"
                    alt=""
                    className={styles.TokenItemLaptopAvatarCrownKingIcon}
                  />
                )
              )
            }
          </div>
        </div>
      )}

      {isMobile ? (
        <>
          <div className={styles.TokenItemLeft}>
            <TokenIcon
              token={{
                ..._token,
                icon: isVideoFile(_token.video)
                  ? _token.icon || _token.video
                  : _token.video,
                is_king: false
              }}
              isPlayButton={false}
            />
          </div>
          <div className={styles.TokenItemRight}>
            <div className={styles.TokenItemProfile}>
              <div className={styles.TokenItemName}>
                <div>{formatLongText(token.token_symbol, 6, 6)}</div>
                {token.is_king &&
                  token.kind === "Hot" &&
                  (token.ranking <= 3 ? (
                    <div className={styles.TokenItemNameIcon}>👑</div>
                  ) : (
                    <img
                      src="/img/trends/crown-second.svg"
                      alt=""
                      className={styles.TokenItemNameIconCrown}
                    />
                  ))}
              </div>
              <TokenItemMarketCap token={token} />
            </div>
            <div className={styles.TokenItemFoot}>
              <TokenItemSummaries
                token={token}
                holders={holders}
                holdersLoading={holdersLoading}
                currentTab={currentTab}
              />
              <div className={styles.TokenItemCreateAt}>
                {token.created2Now}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.TokenItemLaptopFooter}>
          <TokenItemMarketCap token={token} />
          <TokenItemSummaries
            token={token}
            holders={holders}
            holdersLoading={holdersLoading}
            currentTab={currentTab}
          />
        </div>
      )}
    </div>
  );
};

export default TokenItem;

export const TokenItemLoading = (props: any) => {
  const { className } = props;

  const { isMobile } = useUserAgent();

  return (
    <div className={clsx(styles.TokenItemContainer, className)}>
      {isMobile ? (
        <>
          <div className={styles.TokenItemLeft}>
            <Skeleton animated className={styles.TokenItemSkeletonAvatar} />
          </div>
          <div className={styles.TokenItemRight}>
            <div className={styles.TokenItemProfile}>
              <Skeleton animated className={styles.TokenItemSkeletonName} />
              <Skeleton animated className={styles.TokenItemSkeletonName} />
            </div>
            <div className={styles.TokenItemFoot}>
              <Skeleton animated className={styles.TokenItemSkeletonName} />
              <Skeleton animated className={styles.TokenItemSkeletonTime} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.TokenItemSkeletonTopLaptop}>
            <Skeleton
              animated
              className={styles.TokenItemSkeletonAvatarLaptop}
            />
            <div className={styles.TokenItemSkeletonAvatarProfileLaptop}>
              <div className={styles.TokenItemSkeletonAvatarProfileLeftLaptop}>
                <Skeleton animated className={styles.TokenItemSkeletonAvatar} />
                <Skeleton
                  animated
                  className={styles.TokenItemSkeletonNameLaptop}
                />
              </div>
              <Skeleton
                animated
                className={styles.TokenItemSkeletonCreateTimeLaptop}
              />
            </div>
          </div>
          <div className={styles.TokenItemSkeletonFooterLaptop}>
            <Skeleton
              animated
              className={styles.TokenItemSkeletonMarketCapLaptop}
            />
            <div className={styles.TokenItemSkeletonSummariesLaptop}>
              <Skeleton
                animated
                className={styles.TokenItemSkeletonSummaryLaptop}
              />
              <Skeleton
                animated
                className={styles.TokenItemSkeletonSummaryLaptop}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const TokenItemSummaries = (props: any) => {
  const { className, token, holders, holdersLoading, currentTab } = props;

  return (
    <div className={clsx(styles.TokenItemSummaries, className)}>
      {currentTab?.value !== TABS[1].value && (
        <>
          {[0, 1, 2].includes(token.status) ? (
            <SummaryItem
              className={styles.TokenItemSummary}
              type="rocket"
              value={token.launched_like || 0}
            />
          ) : (
            <SummaryItem
              className={styles.TokenItemSummary}
              type="plane"
              value={token.launched_like || 0}
            />
          )}
          <SummaryItem
            className={styles.TokenItemSummary}
            type="user"
            value={holders || 0}
            loading={holdersLoading}
          />
        </>
      )}
      {currentTab?.value === TABS[1].value && (
        <>
          <SummaryItem
            className={styles.TokenItemSummary}
            type="like"
            value={token.like || 0}
          />
          <SummaryItem
            className={styles.TokenItemSummary}
            type="flip"
            value={token.pre_paid || 0}
          />
        </>
      )}
    </div>
  );
};

export const TokenItemMarketCap = (props: any) => {
  const { token } = props;
  const { setMemesListCountdown } = useContext(MemesContext);

  const [countdownFinished, setCountdownFinished] = useState(false);

  return (
    <>
      {Big(token.countdown || 0).gt(0) ? (
        <Countdown
          token={token}
          onFinish={() => {
            setCountdownFinished(true);
            setMemesListCountdown?.({
              [token.id]: 0
            });
          }}
        />
      ) : (
        <div className={Big(token?.market_cap_24h_usd || 0).gte(0) ? styles.TokenItemMarketCap : styles.TokenItemMarketCapDown}>
          MC{" "}
          {numberFormatter(token.market_cap, 2, true, {
            prefix: "$",
            isShort: true,
            isShortUppercase: true
          })}
        </div>
      )}
    </>
  );
};
