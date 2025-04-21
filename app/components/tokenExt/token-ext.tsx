import styles from "./index.module.css";
import type { Project } from "@/app/type";
import { useUserAgent } from "@/app/context/user-agent";
interface Props {
    token: Project;
    showTrade?: boolean;
}

export default function TokenExt({ token, showTrade }: Props) {
    const { isMobile } = useUserAgent();

    // if (isMobile) {
    //     return null;
    // }

    //   if (token.DApp === "sexy") {
    //     return null;
    //   }

    // ray_launchpad
    if (token?.DApp === "ray_launchpad") {
        return (
            <>
                {
                    (token as any).data_type !== "top_project" && (!showTrade || isMobile) && (
                        <div className={styles.TokenExtContainer + ' ' + (isMobile ? styles.Mobile : '')}>
                        </div>
                    )
                }
                <div className={styles.ImgContainer + ' ' + (isMobile ? styles.MobileImgContainer : '')}>
                    <img src="/img/create/raydium.png" className={styles.PlatformImg} alt="raydium" />
                    <div className={styles.ImgText}>Raydium</div>
                </div>
            </>
        );
    }



    return null;
}