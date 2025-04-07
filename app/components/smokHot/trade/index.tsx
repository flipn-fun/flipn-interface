import { useEffect, useState, useMemo, useCallback } from "react";
import styles from "./trande.module.css";
import MainBtn from "@/app/components/mainBtn";
import { Avatar } from "../../thumbnail/avatar";
import type { Project } from "@/app/type";
import Big from "big.js";
import { useTokenTrade } from "@/app/hooks/useTokenTrade";
import { fail, success } from "@/app/utils/toast";
import dayjs from "@/app/utils/dayjs";
import { useAccount } from "@/app/hooks/useAccount";
import { usePrepaidDelayTimeStore } from "@/app/store/usePrepaidDelayTime";
import { actionLikeTrigger } from "@/app/components/timesLike/ActionTrigger";
import { useMessage } from "@/app/context/messageContext";
import useBalance from "@/app/hooks/useBalance";
import { useSetting } from "@/app/store/use-setting";
import { useAuth } from "@/app/context/auth";
import { fontWeight } from "html2canvas/dist/types/css/property-descriptors/font-weight";
import { numberFormatter } from "@/app/utils/common";
import { useConfig } from "@/app/store/useConfig";
import { reportTradeData, ReportDataType } from "@/app/utils/report";
import { useUUID } from "@/app/store/useUUID";

interface Props {
  token: Project;
  onSuccess?: (amount: any) => void;
  panelStyle?: any;
  mainStyle?: any;
  bottomStyle?: any;
  modalShow: boolean;
  onClose?: () => void;
}

const max = 1;
const SOL_PERCENT_LIST = [0.1, 0.5, 1];

export default function Trade({
  token,
  panelStyle,
  modalShow,
  onSuccess,
  onClose,
  mainStyle,
  bottomStyle
}: Props) {
  const { flipMax, set }: any = useSetting();
  const { uuids, set: setUUID }: any = useUUID();
  const [inputVal, setInputVal] = useState(
    flipMax.toString() || max.toString()
  );
  const { updateUserLikeNum } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPrePayd, setIsPrePayd] = useState(false);
  const { address } = useAccount();
  const { config }: any = useConfig();
  const { prepaidDelayTime } = usePrepaidDelayTimeStore();

  const { solBalance } = useBalance({
    mint: token.address as string,
    tokenDecimals: token.tokenDecimals as number,
    reFreshBalnace: 1000
  });

  const { prePaid, checkPrePayed } = useTokenTrade({
    tokenName: token.tokenName,
    tokenSymbol: token.tokenSymbol as string,
    tokenDecimals: token.tokenDecimals as number,
    loadData: false
  });

  const delayTime = useMemo(() => {
    if (!token.createdAt || !prepaidDelayTime) return 0;
    const createdAt = new Date(token.createdAt);
    const now = new Date();
    const delayTime = createdAt.getTime() + prepaidDelayTime;
    if (now.getTime() < delayTime) {
      return dayjs(delayTime).format("YYYY-MM-DD HH:mm:ss");
    }
    return null
  }, [token, prepaidDelayTime]);

  const checkIsOutDate = useCallback(() => {
    if (!token.createdAt || !prepaidDelayTime) return false;
    const createdAt = new Date(token.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    return diffTime > prepaidDelayTime;
  }, [token, prepaidDelayTime]);

  useEffect(() => {
    if (!address || address === token.account) {
      setIsPrePayd(true);
      return;
    }
    // const isOutDate = checkIsOutDate();
    // if (isOutDate) {
    //   setIsPrePayd(true);
    //   return
    // }

    checkPrePayed().then((prdPaydval) => {
      setIsPrePayd(prdPaydval > 0);
    });
  }, [address, token, prepaidDelayTime]);

  useEffect(() => {
    if (!modalShow) {
      setInputVal(flipMax.toString() || max.toString());
      setIsLoading(false);
    }
  }, [modalShow]);



  return (
    <div className={styles.main} style={mainStyle}>
      <div className={styles.avatar}>
        <Avatar data={token} showLaunchType={false} showTicker={false} />
      </div>

      <div
        className={[styles.cationArea, styles.panel].join(" ")}
        style={panelStyle}
      >
        <div className={styles.inputArea}>
          <div className={styles.actionArea}>
            <div className={styles.switchToken}>
              <div className={styles.inputToken}>
                <img src="/img/trade/balance.svg" />
                <div className={styles.tokenName}>
                  {numberFormatter(solBalance, 2, true)} SOL
                </div>
              </div>
            </div>
            <div className={styles.slippage}>Maximum {max} SOL</div>
          </div>
          <div className={styles.inputWrapper}>
            <div className={styles.inputArea}>
              <input
                value={inputVal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  // Check if input value matches any percent tag
                  const isPercentMatch = SOL_PERCENT_LIST.some(
                    (amount) => amount === val
                  );
                  // Only update if valid number
                  if (!isNaN(val)) {
                    setInputVal(e.target.value);
                    set({ flipMax: val });
                  }
                }}
                className={styles.input}
              />
              <div className={styles.sol}>SOL</div>
              <div className={styles.price}>
                $
                {numberFormatter(
                  Number(config.SolPrice) * Number(inputVal),
                  2,
                  true
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tokenPercent}>
        <div
          onClick={() => {
            setInputVal("");
          }}
          className={`${styles.percentTag} button`}
        >
          Reset
        </div>
        {SOL_PERCENT_LIST.map((amount) => (
          <div
            key={amount}
            onClick={() => {
              setInputVal(amount.toString());
              set({ flipMax: amount });
            }}
            className={`${styles.percentTag} ${inputVal === amount.toString() ? styles.active : ""
              } button`}
          >
            {amount}
          </div>
        ))}
        <div
          onClick={() => {
            setInputVal("1");
          }}
          className={`${styles.percentTag} button`}
        >
          Max
        </div>
      </div>
      <div className={styles.Bottom} style={bottomStyle}>
        <div style={{ marginTop: 30 }} className={styles.receiveTokenAmount}>
          {isPrePayd ? (
            <div className={styles.receiveTitle}>
              You have bought this meme. You can view it on your account page.
            </div>
          ) : (
            <div className={styles.receiveTitle}>
              You will auto-buy in at the average price when this meme bonding.{" "}
              <span style={{ color: "#FBCA04" }}>{delayTime
                ? `* Your flipped amount can be refund after ${delayTime}.`
                : "* Your flipped amount can be refund anytime before bonding."}
                </span>
            </div>
          )}
        </div>
        <div style={{ marginTop: 18 }}>
          <MainBtn
            isDisabled={
              !inputVal ||
              Number(inputVal) > max ||
              isPrePayd ||
              Number(inputVal) <= 0 ||
              Number(inputVal) >= Number(solBalance)
            }
            isLoading={isLoading}
            onClick={async () => {
              try {
                if (inputVal) {
                  setIsLoading(true);
                  const inputNum = new Big(inputVal).mul(10 ** 9).toFixed(0);
                  const hash = await prePaid(inputNum, false);

                  reportTradeData(ReportDataType.FLIP, hash, uuids[token.address as string]);
                  // const res = true
                  setIsLoading(false);
                  if (hash) {
                    success("Flip success");
                    // await actionLikeTrigger({
                    //   data: token,
                    //   onShare: showShare,
                    //   onSuccess: updateUserLikeNum
                    // });
                    onSuccess?.(inputVal);
                  }
                }
              } catch (e: any) {
                console.log(e);
                if (e.message) {
                  fail(e.message);
                } else {
                  fail("Transtion fail");
                }
              } finally {
                setIsLoading(false);
              }
            }}
            style={{
              backgroundColor: "#FBCA04",
              color: "#000",
              height: 50,
              fontWeight: 500
            }}
          >
            Flip
          </MainBtn>
        </div>
      </div>
    </div>
  );
}
