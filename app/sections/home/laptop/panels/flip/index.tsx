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
  const { prePaid, checkPrePayed } = useTokenTrade({
    tokenName: token.tokenName,
    tokenSymbol: token.tokenSymbol as string,
    tokenDecimals: token.tokenDecimals as number,
    loadData: false
  });

  const onFlip = useCallback(async () => {
    if (!inputVal) return;
    try {
      setLoading(true);
      const inputNum = new Big(inputVal).mul(10 ** 9).toFixed(0);
      const res = await prePaid(inputNum, false);
      setLoading(false);
      if (res) {
        success("Flip success");
        onSuccess?.(inputVal);
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
  }, [inputVal]);

  useEffect(() => {
    if (!address || address === token.account) {
      setIsPrePaid(true);
      return;
    }
    checkPrePayed().then((prdPaydval) => {
      setIsPrePaid(prdPaydval > 0);
    });
  }, [checkPrePayed, address, token]);

  const errorTips = useMemo(() => {
    if (isPrePaid) {
      const flipNumFormatted = numberFormatter(
        new Big(token.total_amount).div(10 ** 9).toString(),
        4,
        true,
        { isShort: true }
      );
      return `You've fliped ${flipNumFormatted} SOL!`;
    }
    if (isNaN(Number(inputVal)) || Big(inputVal || 0).eq(0))
      return "Enter an amount";
    return Big(inputVal || 0).gt(solBalance || 0) ? "Insufficient Balance" : "";
  }, [solBalance, inputVal, isPrePaid]);

  return (
    <div className={clsx(styles.Container, className)}>
      <div className={clsx(styles.InputWrapper, inputContainerClassName)}>
        <div className={styles.BalanceWrapper}>
          <WalletIcon />
          <div>{numberFormatter(solBalance, 2, true)} SOL</div>
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
        {isMaxLimit && <div className={styles.MaxLimit}>Maximum 1 SOL</div>}
      </div>
      <div className={clsx(styles.DescWrapper, descWrapperClassName)}>
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
        <div className={clsx(styles.Value, valueClassName)}>
          {" "}
          $
          {numberFormatter(Number(config.SolPrice) * Number(inputVal), 2, true)}
        </div>
      </div>
      {isFlipTips && (
        <div className={styles.FlipTips}>
          <strong>Flip:</strong> You will auto-buy in when this meme launched.
          <br /> You can withdraw anytime before launching.
        </div>
      )}
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
