import type { Project } from "@/app/type";
import LaunchTag from "../tag/status";
import Import from "../tag/import";
import Gofund from "../tag/gofund";
import Raydium from "../tag/raydium";
import styles from "./TokenTags.module.css";
import { useMemo } from "react";
import Meteora from "../tag/meteora";

interface Props {
  token: Project;
}

export default function TokenTags({ token }: Props) {
  const status = useMemo(() => {
    if (token.initiativeLaunching && token.status === 0) {
      return 1;
    }

    return token.status;
  }, [token]);

  return (
    <div className={styles.tags}>
      <LaunchTag type={status as number} />
      {token.DApp === "pump" && <Import />}
      {token.DApp === "gofund" && <Gofund />}
      {token.DApp?.includes("ray_launchpad") && <Raydium />}
      {token.DApp?.includes("meteora") && <Meteora />}
    </div>
  );
}
