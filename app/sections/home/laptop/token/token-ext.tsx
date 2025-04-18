import styles from "./index.module.css";
import type { Project } from "@/app/type";
import { useUserAgent } from "@/app/context/user-agent";
interface Props {
    token: Project;
}

export default function TokenExt({ token }: Props) {
    const { isMobile } = useUserAgent();

    if (isMobile) {
        return null;
    }

    //   if (token.DApp === "sexy") {
    //     return null;
    //   }

    // ray_launchpad
    if (token?.DApp === "ray_launchpad") {
        return (
            <>
                <div className={styles.TokenExtContainer}>
                </div>
                <div className={styles.ImgContainer}>
                    <img src="/img/create/raydium.png" className={styles.PlatformImg} alt="raydium" />
                    <div className={styles.ImgText}>Raydium</div>
                </div>
            </>
        );
    }



    return null;
}