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

const step2 = <div className={styles.step2}>
    <img src={icons[2]} alt="step2" />
</div>

const step21 = <div className={styles.step1}>
    <img src={icons[2]} alt="step2" />
</div>

function Panel({ children, style }: any) {
    return <div className={styles.panel} style={style}>{children}</div>;
}

export default function Guiding() {
    const { innerWidth } = useUserAgent();

    return <GuidingTour steps={[{
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
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
        showAction: true,
        content: <Panel style={{ width: 260, marginLeft: 35 }}>
            <strong>Great! </strong>
            <div className={styles.text}>Let{'’'}s first learn <span className={styles.importantText}>how to navigate</span>!</div>
            <div className={styles.text}>FlipN works <span className={styles.importantText}>similarly to Tiktok</span> where you <span className={styles.importantText}>scroll up & down</span> to view different videos & memecoins!</div>
            {step1}
        </Panel>,
    }, {
        selector: () => document.querySelector('#tabs-bottom-wrapper'),
        placement: MaskPlacement.Bottom,
        content: <div className={styles.scroll}>
            <div>Scroll down 3 times</div>
            <div>
                {
                    [1, 2].map(num => {
                        return <div key={num} className={styles.scrollItem}>
                            <svg width="25" height="11" viewBox="0 0 25 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L12.5 9L24 1" stroke="white" stroke-width="2" stroke-linecap="round" />
                            </svg>
                        </div>
                    })
                }
            </div>
        </div>,
        showAction: false,
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        content: <Panel style={{ width: 260, marginLeft: 35 }}>
            <div className={styles.text}>Good job. Now you know how to navigate content & memecoins!</div>
            <div className={styles.text}><span className={styles.importantText}>Doge</span> - my friend will now show you the next steps!</div>
            {step1}
        </Panel>,
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35 }}>
            <div className={styles.text}>Here you can see the different feeds of memecoins = videos on FlipN.</div>
            <div className={styles.text}>We{'’'}re at {'‘'}<span className={styles.importantText}>For You</span>{'’'} - the feed that{'’'}s curated based on your preferred content & what{'’'}s trending.</div>
            {step2}
        </Panel>,
        type: 'button',
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        content: <Panel style={{ width: 260, marginLeft: 35 }}>
            <div className={styles.text}>When a memecoins = videos are posted on FlipN, they go through 3 phases: <span className={styles.importantText}>Genesis, Ticking</span> and <span className={styles.importantText}>Listed</span>.</div>
            {step21}
        </Panel>,
        type: 'button',
    }, {
        selector: () => document.querySelector('#home-tab-genesis'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35, }}>
            <div className={styles.text}><span className={styles.importantText}>Genesis</span> is the pre-engagement phase, where the memecoins are opened for <span className={styles.importantText}>public interaction</span> and haven’t entered the <span className={styles.importantText}>Bonding Curve</span>.</div>
            <div className={styles.text}>Videos need to get <span className={styles.importantText}>100 likes</span> to proceed to the <span className={styles.importantText}>Ticking</span> phase (Bonding Curve).</div>
            {step2}
        </Panel>,
        type: 'button',
    }, {
        selector: () => document.querySelector('#home-tab-ticking'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35, }}>
            <div className={styles.text}><span className={styles.importantText}>Ticking phase</span> is where public trading is enabled.</div>
            <div className={styles.text}>Memecoins must accumulate <span className={styles.importantText}>42 SOL</span> in liquidity to <span className={styles.importantText}>graduate</span> to <span className={styles.importantText}>Meteora</span>.</div>
            {step2}
        </Panel>,
        type: 'button',
    }]} />
}
