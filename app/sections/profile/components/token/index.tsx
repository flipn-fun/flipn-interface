import { useEffect, useMemo, useState } from "react";
import styles from "./token.module.css";
import type { Project } from "@/app/type";
import { httpAuthDelete, httpAuthPost, simplifyNum } from "@/app/utils";
import { useRouter } from "next/navigation";
import { useTokenTrade } from "@/app/hooks/useTokenTrade";
import TokenAction from "../tokenAction";
import useMc from "@/app/hooks/useMc";
import { formatLongText, numberFormatter } from "@/app/utils/common";
import Big from "big.js";
import { SOL } from "@/app/components/trade/buySellPump";
import { useUser } from "@/app/store/useUser";
import { Program } from "@coral-xyz/anchor";
import idl from "@/app/hooks/meme_launchpad.json";
import { useConnection } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { fail, success } from '@/app/utils/toast';
import Media from "@/app/components/thumbnail/media";
import { useUserAgent } from "@/app/context/user-agent";
import { videoReg } from '@/app/components/upload';

interface Props {
  data: Project;
  update: () => void;
  prepaidWithdrawDelayTime: number;
  hideHot?: boolean;
  from?: string;
  type?: string;
  isOther: boolean;
  onWithdrawSuccess?(): void;
  onCollectSuccess?(): void;
}

const likeStatus: any = {}

export default function Token({
  data,
  update,
  prepaidWithdrawDelayTime,
  hideHot,
  type,
  from,
  isOther,
  onWithdrawSuccess,
  onCollectSuccess
}: Props) {
  const router = useRouter();
  const { userInfo }: any = useUser();
  const { connection } = useConnection();
  const { isMobile } = useUserAgent();
  const [_likeStatus, setLikeStatus] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const [prepaidRealAmount, setPrepaidRealAmount] = useState(Big(0));
  const [prepaidAmount, setPrepaidAmount] = useState(Big(0));
  const [tokenAmount, setTokenAmount] = useState(Big(0));


  const {
    pool,
    checkPrePayed,
    prepaidSolWithdraw,
    prepaidTokenWithdraw,
    programId
  } = useTokenTrade({
    tokenName: data?.tokenName as string,
    tokenSymbol: data?.tokenSymbol as string,
    tokenDecimals: data?.tokenDecimals as number,
    loadData: false
  });

  const isPrepaid = useMemo(() => {
    return Big(prepaidAmount || 0).gt(0);
  }, [prepaidAmount]);

  const isDelay = useMemo(() => {
    if (
      prepaidWithdrawDelayTime &&
      data.createdAt &&
      Date.now() - data.createdAt > prepaidWithdrawDelayTime
    ) {
      return true;
    }
    return false;
  }, [prepaidWithdrawDelayTime, data]);

  const smookeable = useMemo(() => {
    if (data.isSuperLike) {
      return 1;
    }
    // fix#REF-9596 👇
    if (data.account === userInfo?.address) return false;
    return 2;
  }, [data, userInfo]);

  const showWithdraw = useMemo(
    () => isDelay && !isOther && isPrepaid,
    [isDelay, isOther, isPrepaid]
  );



  useEffect(() => {
    if (
      isOther ||
      (!data?.isSuperLike && data?.account !== userInfo?.address)
    ) {
      setPrepaidRealAmount(Big(0));
      setPrepaidAmount(Big(0));
      return;
    }
    checkPrePayed().then((res) => {
      const _amount = Big(res || 0).div(10 ** SOL.tokenDecimals);
      setPrepaidRealAmount(_amount);
      setPrepaidAmount(Big(_amount).div(0.985));
    });
  }, [
    type,
    isOther,
    data?.tokenName,
    data?.tokenSymbol,
    data?.tokenDecimals,
    data?.isSuperLike,
    userInfo?.address
  ]);

  useEffect(() => {
    if (
      pool &&
      pool.length &&
      (showWithdraw ||
        (Number(prepaidRealAmount) > 0 && Number(data?.status || 0) > 0))
    ) {
      const program = new Program<any>(idl, programId, {
        connection: connection
      } as any);
      program.account.pool
        .fetch(pool[0])
        .then((poolData: any) => {
          let { prepaidAmount, prepaidBoughtTokenAmount } = poolData || {};
          prepaidAmount = Big(prepaidAmount.toNumber());
          prepaidBoughtTokenAmount = Big(prepaidBoughtTokenAmount.toNumber());
          const _tokenAmount = Big(prepaidRealAmount)
            .times(10 ** SOL.tokenDecimals)
            .div(prepaidAmount)
            .times(prepaidBoughtTokenAmount)
            .div(10 ** (data?.tokenDecimals || 6));
          setTokenAmount(_tokenAmount);

          // console.log(
          //   '%c[TokenAmount - %o] prepaidRealAmount: %o, prepaidAmount: %o, prepaidBoughtTokenAmount: %o, _tokenAmount: %o',
          //   'background:#ff5f00;color:#fff;',
          //   data.tokenSymbol,
          //   prepaidRealAmount.toString(),
          //   prepaidAmount.toString(),
          //   prepaidBoughtTokenAmount.toString(),
          //   _tokenAmount.toString(),
          // );
        })
        .catch((err) => {
          // console.log('%cCalc token amount failed - %o: %o', 'background:#ff5f00;color:#fff;', data.tokenSymbol, err);
          setTokenAmount(Big(0));
        });
      return;
    }
    setTokenAmount(Big(0));
  }, [pool, data, data?.tokenDecimals, prepaidRealAmount, showWithdraw]);

  // console.log('likeStatus:', likeStatus)

  return (
    <div
      className={styles.main}
      style={{
        width: from === "page" ? 340 : "100%",
        backgroundColor:
          from === "page" ? "transparent" : (isMobile ? "" : "rgba(255, 255, 255, 0.08)"),
        flexDirection: from === "page" ? "column" : "row",
        gap: from === "page" ? 10 : 0,
        padding: from === "page" ? 0 : "10px 15px",
        alignItems: from === "page" ? "flex-start" : "center",
      }}
      onClick={() => {
        router.push("/detail?address=" + data.address + "&from=profile");
      }}
    >
      <div
        className={isMobile ? styles.tokenMagMobile : styles.tokenMag}
        style={{
          height: from === "page" ? 112 : "auto",
          // width: from === "page" ? "100%" : "auto",
          backgroundColor:
            from === "page" ? "rgba(255, 255, 255, 0.05)" : "transparent",
          padding: from === "page" ? "4px 12px 15px" : '0 0 0 32px',
          borderRadius: from === "page" ? 10 : 0
        }}
      >
        <div className={`${styles.tokenImgContent}`}>
          <Media
            data={{
              ...data,
              // fix#REF-10095
              tokenImg: videoReg.test(data.token_video || "") ? (data.token_icon || data.token_video) : (data.token_video || data.token_icon),
            }}
            imgHeight={84}
            autoPlay={false}
            imgStyle={{
              width: 84,
              borderRadius: 7,
            }}
            style={{
              overflow: "hidden",
              borderRadius: 7,
            }}
            videoStyle={{
              height: "100%",
              background: "#000",
              borderRadius: 7,
            }}
          />
          {
            (videoReg.test(data.token_video || "") && !!data.token_icon && !videoReg.test(data.token_icon || "")) && (
              <div className={styles.tokenVideoWrapper} style={{ display: "none" }}>
                <img src="/img/icon-play.svg" alt="" className={styles.tokenVideoPlayIcon} />
              </div>
            )
          }

          {
            (data.DApp === 'sexy' || data.DApp?.includes('meteora') || data.DApp?.includes('ray_launchpad') || data.DApp === 'gofund' || data.DApp === 'pump') && (
              <div className={styles.platformIcon}>
                {data.DApp === 'sexy' && <img src="/img/create/flip.svg" alt="" />}
                {data.DApp?.includes('ray_launchpad') && <img src="/img/create/raydium.png" alt="" />}
                {data.DApp?.includes('meteora') && <img src="/img/create/meteora.png" alt="" />}
                {data.DApp === 'gofund' && <img src="/img/home/GFM.svg" alt="" />}
                {data.DApp === 'pump' && <img src="/img/home/pump.png" alt="" />}
                </div>
            )
          }

          {
            (data.DApp === 'import') && (
              <div className={styles.importTag}>
                <img src="/img/create/import.svg" alt="" />
              </div>
            )
          }

          <LaunchTag type={data.status as number} />
          {/* {
            data.DApp === "pump" && (
              <img src="/img/profile/icon-pump.svg" alt="" className={styles.PumpIcon} />
            )
          } */}
        </div>

        <div
          className={isMobile ? styles.nameContent : styles.nameContentLaptop}
        >
          <div className={styles.name}>
            {formatLongText(data.tokenName, 15, 4)}
          </div>
          <div className={styles.trikerContent}>
            <div className={styles.tickerName}>
              <div className={styles.tickerNameText}>Ticker: {data.ticker}</div>
              <div
                className={styles.tickerNameAvatar}
                style={{
                  backgroundImage: `url("${data.tokenIcon || "/img/token-placeholder.png"
                    }")`,
                  border:
                    data.status === 0 && !!smookeable && !showWithdraw
                      ? `${smookeable === 1
                        ? "1px dashed #FFF"
                        : "1px dashed #9290B1"
                      }`
                      : ""
                }}
              />
            </div>
          </div>
          {data?.status === 0 ? (
            <>
              {/*<div className={styles.trikerContent}>
                <div className={styles.Likes}>
                  <div>
                    Likes: <span style={{ color: "white" }}>{data?.like}</span>
                    /100
                  </div>
                  <img
                    src="/img/profile/icon-like.svg"
                    alt=""
                    width={13}
                    height={11}
                  />
                </div>
              </div>*/}
              <div className={styles.trikerContent}>
                <div className={styles.tickerName}>
                  Flipped:{" "}
                  {numberFormatter(
                    Big(data?.prePaidAmount || 0).div(10 ** SOL.tokenDecimals),
                    2,
                    true
                  )}{" "}
                  SOL
                </div>
              </div>
            </>
          ) : (
            <div className={styles.MarketCap}>
              MarketCap:{" "}
              {`$${simplifyNum(Number((data as any).market_cap || 0), 2)}`}
            </div>
          )}
        </div>

        <div className={styles.collectIcon + ' ' + (isMobile ? styles.collectIconMobile : '')} onClick={async (e) => {
          if (isLoading) return;
          e.stopPropagation();
          setIsLoading(true);
          let res = null;
          const isCollect = typeof (_likeStatus[data.id!]) === 'undefined' ? (data as any).is_collect : likeStatus[data.id!];

          likeStatus[data.id!] = !(data as any).is_collect;
          setLikeStatus(likeStatus)
          if (isCollect) {
            res = await httpAuthDelete('/project/collect?id=' + data.id)
            onCollectSuccess?.()
          } else {
            res = await httpAuthPost('/project/collect?id=' + data.id)
          }

          if (res?.code === 0) {
            (data as any).is_collect = !isCollect;
            success(isCollect ? 'Successfully canceled' : 'Successfully collected')
          } else {
            fail('Request Failed')
          }

          likeStatus[data.id!] = (data as any).is_collect;
          setLikeStatus(likeStatus)
          setIsLoading(false);
        }}>
          {
            (typeof (_likeStatus[data.id!]) === 'undefined' ? (data as any).is_collect : likeStatus[data.id!])
              ? <img src="/img/home/star-full-2.svg" alt="" style={{ width: 20, height: 20 }} />
              : <img src="/img/home/star-empty-2.svg" alt="" style={{ width: 20, height: 20 }} />
          }
        </div>
      </div>

      <div
        className={isMobile ? styles.BottomMobile : styles.Bottom}
        style={{
          width: from === "page" ? "100%" : "auto"
        }}
        onClick={(ev) => {
          ev.stopPropagation();
        }}
      >
        {from === "page" && (
          <div className={styles.Time}>{dayjs(data.time).fromNow()}</div>
        )}
        <TokenAction
          isOther={isOther}
          isDelay={isDelay}
          token={data}
          prepaidWithdrawDelayTime={prepaidWithdrawDelayTime}
          onWithdrawSuccess={onWithdrawSuccess}
          prepaidRealAmount={prepaidRealAmount}
          prepaidAmount={prepaidAmount}
          smookeable={smookeable}
          showWithdraw={showWithdraw}
          isPrepaid={isPrepaid}
          prepaidSolWithdraw={prepaidSolWithdraw}
          prepaidTokenWithdraw={prepaidTokenWithdraw}
          tokenAmount={tokenAmount}
        />
      </div>
    </div>
  );
}

function LaunchTag({ type }: { type: number }) {
  if (type === 0) {
    return (
      <div className={styles.launchTag + " " + styles.launch1}>Genesis</div>
    );
  }

  if (type === 1) {
    return (
      <div className={styles.launchTag + " " + styles.launch2}>Bonding</div>
    );
  }

  if (type === 3) {
    return (
      <div className={styles.launchTag + " " + styles.launch3}>Listed</div>
    );
  }
}
