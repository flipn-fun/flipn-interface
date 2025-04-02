import { simplifyNum } from "@/app/utils";
import styles from "./index.module.css";
import { ProgressBar } from "antd-mobile";
import ZeroFormat from "@/app/components/zeroFomat";
import Big from "big.js";
import { numberFormatter } from "@/app/utils/common";
import { useConfig } from "@/app/store/useConfig";
import useGoFund from "@/app/hooks/useGoFund";
export default function LaunchesStatus({ data }: any) {
  const { config }: any = useConfig();
  const { progress } = useGoFund({ token: data });

  return (
    <div className={styles.panel}>
      {data.status === 1 && (
        <div className={styles.singleProgress}>
          <div className={styles.progressTitleWrapper}>
            <div className={styles.progressPercent}>
              {data.bondingProgress || progress}%
            </div>
            <div className={styles.progressTitle}>
              {numberFormatter(new Big(data.solReserve || 0).div(10 ** 9).toString(), 2, true)} SOL / <span style={{ color: "#9290B1" }}>40.56 SOL</span>
            </div>
          </div>

          <ProgressBar
            percent={data.bondingProgress || progress}
            style={{
              "--track-width": "6px",
              "--fill-color": "#C9FF5D",
              "--track-color": "#3C3C3C80"
            }}
          />
        </div>
      )}

      <div
        className={styles.priceContent}
        style={{ marginTop: data.status === 1 ? 15 : 0 }}
      >
        <div className={styles.priceNums}>
          <div className={styles.priceAmount} style={{ color: Number(data.marketCap24hUsd) >= 0 ? "#c9ff5d" : "#ff2681" }}>
            ${data.mc && simplifyNum(Number(data.mc), 2)}
          </div>
          {Number(data.marketCap24hUsd) >= 0 && (
            <div className={styles.priceUp}>
              +${simplifyNum(Math.abs(Number(data.marketCap24hUsd)), 2)}
            </div>
          )}
          {Number(data.marketCap24hUsd) < 0 && (
            <div className={styles.priceDown}>
              -${simplifyNum(Math.abs(Number(data.marketCap24hUsd)), 2)}
            </div>
          )}
        </div>
        <div className={styles.priceUnitSol}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}><ZeroFormat value={data.price} /> SOL</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: 9, fontWeight: 300, color: "#9290B1", }}>$<ZeroFormat value={Number(config.SolPrice) * Number(data.price)} /></div>
        </div>
      </div>
    </div>
  );
}
