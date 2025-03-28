import WalletIcon from "./wallet-icon";
import styles from "./index.module.css";
import Big from "big.js";
import useBalance from "@/app/hooks/useBalance";
import { useSetting } from "@/app/store/use-setting";
import { useCallback, useState, useEffect, useMemo } from "react";
import { useConfig } from "@/app/store/useConfig";
import { useTokenTrade } from "@/app/hooks/useTokenTrade";
import { useAccount } from "@/app/hooks/useAccount";
import { numberFormatter } from "@/app/utils/common";
import { fail, success } from "@/app/utils/toast";
import CircleLoading from "@/app/components/icons/loading";
import clsx from "clsx";
import { reportTradeData, ReportDataType } from "@/app/utils/report";
import dayjs from "dayjs";
import { usePrepaidDelayTimeStore } from "@/app/store/usePrepaidDelayTime";


const isPrepaidCache = new Map<string, any>();
export default function FlipPanel(props: any) {
  const {
    from,
    token,
    onClose,
    onSuccess,
    className,
    inputClassName,
    inputContainerClassName,
    inputBoxClassName,
    valueClassName,
    tagsClassName,
    descWrapperClassName,
    buttonClassName,
    isMaxLimit,
    isFlipTips,
    flipButtonText
  } = props;
  const { flipMax, set }: any = useSetting();
  const [inputVal, setInputVal] = useState("0");
  const { solBalance } = useBalance({
    mint: token.address as string,
    tokenDecimals: token.tokenDecimals as number,
    reFreshBalnace: 1000
  });
  const { config }: any = useConfig();
  const [loading, setLoading] = useState(false);
  const [isPrePaid, setIsPrePaid] = useState(false);
  const { address } = useAccount();
  const [reFresh, setRefresh] = useState(1);
  const { prepaidDelayTime } = usePrepaidDelayTimeStore();
  const { prePaid, checkPrePayed } = useTokenTrade({
    tokenName: token.tokenName,
    tokenSymbol: token.tokenSymbol as string,
    tokenDecimals: token.tokenDecimals as number,
    loadData: false
  });

  console.log('token', token)

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

  const onFlip = async () => {
    if (!inputVal) return;
    try {
      setLoading(true);
      const inputNum = new Big(inputVal).mul(10 ** 9).toFixed(0);
      const hash = await prePaid(inputNum, false);
      setLoading(false);
      if (hash) {
        reportTradeData(ReportDataType.FLIP, hash);
        isPrepaidCache.set(token.address, inputVal);
        success("Flip success");
        onSuccess?.(inputVal);
        setRefresh(reFresh + 1);
      }
    } catch (e: any) {
      console.log(e);
      if (e.message) {
        fail(e.message);
      } else {
        fail("Transtion fail");
      }
    } finally {
      setLoading(false);
    }
  };

  const isReFunded = useMemo(() => {
    console.log('token.withdrawAmount', token.withdrawAmount)
    if (!token.withdrawAmount) return false;
    return token.withdrawAmount > 0;
  }, [token.withdrawAmount]);

  useEffect(() => {
    if (!address || address === token.account) {
      setIsPrePaid(true);
      return;
    }

    if (Number(token.total_amount) > 0 || isPrepaidCache.get(token.address)) {
      setIsPrePaid(true);
    } else {
      setIsPrePaid(false);
    }

    // checkPrePayed().then((prdPaydval) => {
    //   setIsPrePaid(prdPaydval > 0);
    // });
  }, [address, token, reFresh]);

  const prepaidTotalAmount = useMemo(() => {
    if (isPrepaidCache.has(token.address)) {
      return isPrepaidCache.get(token.address);
    }

    if (token.total_amount) {
      return token.total_amount;
    }

    return 0;
  }, [token, reFresh]);

  const errorTips = useMemo(() => {
    if (isReFunded) {
      return `You have withdrawn your Flip Funds`;
    }

    if (isPrePaid) {
      const flipNumFormatted = numberFormatter(
        (prepaidTotalAmount),
        4,
        true
      );
      return `You've flipped ${flipNumFormatted} SOL!`;
    }
    if (isNaN(Number(inputVal)) || Big(inputVal || 0).eq(0))
      return "Enter an amount";
    if (Number(inputVal) > 1) return "Maximum 1 SOL";
    return Big(inputVal || 0).gt(solBalance || 0) ? "Insufficient Balance" : "";
  }, [solBalance, inputVal, isPrePaid, isReFunded, prepaidTotalAmount, reFresh]);

  return (
    <div className={clsx(styles.Container, className)}>
      <div className={clsx(styles.InputWrapper, inputContainerClassName)}>
        <div className={styles.InputTop}>
          <div className={styles.BalanceWrapper}>
            <WalletIcon />
            <div>{numberFormatter(solBalance, 2, true)} SOL</div>
          </div>

          <div className={clsx(styles.Tags, tagsClassName)}>
            {[0.1, 0.5, 1].map((item) => (
              <div
                key={item}
                className={`${styles.Tag}`}
                onClick={() => {
                  setInputVal(item.toString());
                }}
              >
                {item}
              </div>
            ))}
            <div
              className={`${styles.Tag}`}
              onClick={() => {
                if (!isNaN(Number(solBalance))) {
                  setInputVal(solBalance);
                }
              }}
            >
              Max
            </div>
          </div>
        </div>

        <div className={clsx(styles.InputBox, inputBoxClassName)}>
          <input
            className={clsx(styles.Input, inputClassName)}
            value={inputVal}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!isNaN(val)) {
                setInputVal(e.target.value);
                set({ flipMax: val });
              }
            }}
          />
          <div>SOL</div>
        </div>
      </div>
      <div className={clsx(styles.DescWrapper, descWrapperClassName)}>
        <div style={{ color: "#FBCA04", fontSize: 10, fontWeight: 300 }}>
          {delayTime
            ? `* Your flipped amount can be refund after ${delayTime}.`
            : "* Your flipped amount can be refund anytime before bonding."}
        </div>
        <div className={clsx(styles.Value, valueClassName)}>
          {" "}
          $
          {numberFormatter(Number(config.SolPrice) * Number(inputVal), 2, true)}
        </div>
      </div>
      {/* {isFlipTips && (
        <div className={styles.FlipTips}>
          <strong>Flip:</strong> You will auto-buy in when this meme launched.
          <br /> You can withdraw anytime before launching.
        </div>
      )} */}
      {address ? (
        <button
          className={`${clsx(styles.Button, buttonClassName)} button`}
          disabled={loading || !!errorTips}
          onClick={onFlip}
        >
          {loading ? (
            <CircleLoading size={16} />
          ) : (
            errorTips || flipButtonText || "Flip it!"
          )}
        </button>
      ) : (
        <button
          className={`${clsx(styles.Button, buttonClassName)} button`}
          onClick={() => {
            window?.connect();
          }}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
