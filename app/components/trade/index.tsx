import styles from "./trande.module.css";
import BuySell from "./buySell";
import BuySellLaunched from "./buySellLaunched";
import BuySellPump from "./buySellPump";
import BuySellGofund from "./buySellGoFund";
import BuySellRaydium from "./buySellRaydium";
import BuySellMeteora from "./buySellMeteora";
import type { Project } from "@/app/type";

interface Props {
  token: Project;
  initType?: string;
  from?: string;
  show?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function Trade({
  token,
  initType = "buy",
  from,
  show,
  onClose,
  onSuccess
}: Props) {

  return (
    <div className={styles.main}>
      {token.status === 1 && token.DApp === "pump" && (
        <BuySellPump
          token={token}
          initType={initType}
          show={show}
          from={from}
          onClose={() => {
            onClose && onClose();
          }}
          onSuccess={onSuccess}
        />
      )}
      {token.status === 1 && token.DApp?.includes("ray_launchpad") && (
        <BuySellRaydium
          token={token}
          initType={initType}
          show={show}
          from={from}
          onClose={() => {
            onClose && onClose();
          }}
          onSuccess={onSuccess}
        />
      )}
      {token.status === 1 && token.DApp?.includes("meteora") && (
        <BuySellMeteora
          token={token}
          initType={initType}
          show={show}
          from={from}
          onClose={() => {
            onClose && onClose();
          }}
          onSuccess={onSuccess}
        />
      )}
      {token.status === 1 && token.DApp === "gofund" && (
        <BuySellGofund
          token={token}
          initType={initType}
          show={show}
          from={from}
          onClose={() => {
            onClose && onClose();
          }}
          onSuccess={onSuccess}
        />
      )}
      {token.status === 1 && token.DApp === "sexy" && (
        <BuySell
          token={token}
          initType={initType}
          from={from}
          show={show}
          onClose={() => {
            onClose && onClose();
          }}
          onSuccess={onSuccess}
        />
      )}
      {token.status === 3 && (
        <BuySellLaunched
          token={token}
          initType={initType}
          show={show}
          from={from}
          onClose={() => {
            onClose && onClose();
          }}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
