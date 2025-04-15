import GuidingTour from "@/app/components/guiding-tour";
import { MaskPlacement } from "@/app/components/guiding-tour/get-style-rect";
import { useUserAgent } from "@/app/context/user-agent";
import styles from './index.module.css';

const icons = {
    1: '/img/home/guide/step1.png',
    2: '/img/home/guide/step2.png',
    3: '/img/home/guide/step3.png',
    4: '/img/home/guide/step4.png',
}

const step1 = <div className={styles.step1}>
    <img src={icons[1]} alt="step1" />
</div>

function Panel({ children, style }: any) {
    return <div className={styles.panel} style={style}>{children}</div>;
}

export default function Guiding() {
    const { innerWidth } = useUserAgent();

    return <GuidingTour steps={[{
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        content: <Panel style={{ width: 260, marginLeft: 45 }}>
            <strong>GM, welcome to FlipN frens!</strong>
            <div className={styles.text}>FlipN is the platform where you can <span className={styles.importantText}>earn, launch & trade memecoins</span> as easy as <span className={styles.importantText}>scrolling Tiktok</span>.</div>
            <div className={styles.text}>This is the place where we <span className={styles.importantText}>Make Memes Great Again!</span></div>
            <div className={styles.text}>Would you <span className={styles.importantText}>allow us</span> to give you a <span className={styles.importantText}>walkthrough</span> of the platform?</div>
            {step1}
        </Panel>,
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        content: <Panel style={{ width: 260, marginLeft: 35 }}>
            <strong>Great! </strong>
            <div className={styles.text}>Let{'’'}s first learn <span className={styles.importantText}>how to navigate</span>!</div>
            <div className={styles.text}>FlipN works <span className={styles.importantText}>similarly to Tiktok</span> where you <span className={styles.importantText}>scroll up & down</span> to view different videos & memecoins!</div>
            {step1}
        </Panel>,
    }, {
        selector: () => document.querySelector('#tabs-bottom-wrapper'),
        placement: MaskPlacement.Top,
        content: <div>22222</div>,
    }]} />
}
