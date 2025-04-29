import styles from "./index.module.css";
import { simplifyNum } from "@/app/utils";
import TradeButton from "./button";
import useGoFund from "@/app/hooks/useGoFund";
import { useMemo } from "react";
import Big from "big.js";

export default function Trade({ token, isCurrent, onClick }: any) {
  const { progress } = useGoFund({ token });

  const rayProgress = useMemo(() => {
    if (token.DApp?.includes('ray_launchpad')) {
      if (Number(token.read_base) > 0) {
        const bondingProgress = new Big(token.read_base).div('800000000000000').mul(100).toNumber()
        if (bondingProgress > 100) {
          return 100
        }
        return new Big(bondingProgress).toFixed(2, 1)
      }
    }
    return 0
  }, [token])

  const realyProgress = useMemo(() => {
    if (token.DApp?.includes('ray_launchpad')) {
      return rayProgress
    }
    return token.bondingProgress || progress || '0'
  }, [token, rayProgress, progress])

  return (
    <div className={`${styles.Container}`} onClick={onClick}>
      {token.bondingProgress < 100 && token.status !== 3 ? (
        <div>
          <div className={styles.McWrapper}>
            <div className={styles.McBox}>
              <div
                className={styles.Mc}
                style={{
                  color:
                    Number(token.marketCap24hUsd) < 0 ? "#FF2681" : "#C9FF5D"
                }}
              >
                ${Number(token.mc) > 0 ? simplifyNum(Number(token.mc), 2) : "-"}
              </div>
              <div>MC</div>
            </div>
            <div>{realyProgress}%</div>
          </div>
          <div className={styles.Progress}>
            <div
              className={styles.ProgressInner}
              style={{
                width: `${realyProgress}%`
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          <div>Market Cap</div>
          <div
            className={styles.Mc}
            style={{
              color: token.marketCap24hUsd < 0 ? "#FF2681" : "#C9FF5D"
            }}
          >
            ${Number(token.mc) > 0 ? simplifyNum(Number(token.mc), 2) : "-"}
          </div>
        </div>
      )}
      {isCurrent && <TradeButton token={token} onClick={onClick} />}
    </div>
  );
}
