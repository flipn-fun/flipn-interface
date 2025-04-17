import GuidingTour from "@/app/components/guiding-tour";
import { MaskPlacement } from "@/app/components/guiding-tour/get-style-rect";
import { useUserAgent } from "@/app/context/user-agent";
import styles from './index.module.css';
import { useAccount } from "@/app/hooks/useAccount";
import { useUser } from "@/app/store/useUser";

const icons = {
    1: '/img/home/guide/step1.png',
    2: '/img/home/guide/step2.png',
    3: '/img/home/guide/step3.png',
    4: '/img/home/guide/step4.png',
    5: '/img/home/guide/arrow-right-bottom.svg',
    6: '/img/home/guide/arrow-left-bottom.svg',
    7: '/img/home/guide/arrow-left-bottom-2.svg',
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

const step3 = <div className={styles.step2}>
    <img src={icons[3]} alt="step2" />
</div>

const step4 = <div className={styles.step2}>
    <img src={icons[4]} alt="step2" />
</div>

const arrowRightBottom = <div className={styles.arrowRightBottom}>
    <img src={icons[5]} alt="arrow" />
</div>

const arrowLeftBottom = <div className={styles.arrowLeftBottom}>
    <img src={icons[7]} alt="arrow" />
</div>

const arrowLeftBottom2 = <div className={styles.arrowLeftBottom2}>
    <img src={icons[6]} alt="arrow" />
</div>

const arrowRightBottom2 = <div className={styles.arrowRightBottom2}>
    <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.07213 1.65791C1.52892 12.0534 7.72094 32.6366 28.8347 31.8054M28.8347 31.8054L22.6568 26.5162M28.8347 31.8054L22.8791 36.5645" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
</div>

function Panel({ children, style }: any) {
    return <div className={styles.panel} style={style}>{children}</div>;
}


function topTabRect(elementWidth: number, elementHeight: number, elementRect: ClientRect) {
    return {
        width: elementWidth - 16,
        height: elementHeight - 10,
        left: elementRect.left + 8,
        top: elementRect.top + 0,
    }
}

export default function Guiding() {
    const { address } = useAccount();
    const { userInfo } = useUser();
    const { innerWidth, isMobile } = useUserAgent();

    if (!address || !userInfo.id) {
        return null;
    }

    if (!isMobile) {
        return null;
    }

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
        eleOuterOffset: topTabRect,
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        content: <Panel style={{ width: 260, marginLeft: 35 }}>
            <div className={styles.text}>When a memecoins = videos are posted on FlipN, they go through 3 phases: <span className={styles.importantText}>Genesis, Ticking</span> and <span className={styles.importantText}>Listed</span>.</div>
            {step21}
        </Panel>,
        type: 'button',
        eleOuterOffset: topTabRect,
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
        eleOuterOffset: (elementWidth: number, elementHeight: number, elementRect: ClientRect) => {
            return {
                width: elementWidth + 16,
                height: elementHeight + 6,
                left: elementRect.left - 8,
                top: elementRect.top - 6,
                paddingTop: 6,
                paddingLeft: 5,
            }
        }
    }, {
        selector: () => document.querySelector('#home-tab-ticking'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35, }}>
            <div className={styles.text}><span className={styles.importantText}>Bonding</span> phase is where public trading is enabled.</div>
            <div className={styles.text}>Memecoins must accumulate <span className={styles.importantText}>42 SOL</span> in liquidity to <span className={styles.importantText}>graduate</span> to <span className={styles.importantText}>Meteora</span>.</div>
            <div className={styles.text}>This phase facilitates <span className={styles.importantText}>efficient price formation</span> and liquidity accumulation, ensuring a <span className={styles.importantText}>smooth transition</span> to the broader trading ecosystem.</div>
            {step2}
        </Panel>,
        type: 'button',
        eleOuterOffset: (elementWidth: number, elementHeight: number, elementRect: ClientRect) => {
            return {
                width: elementWidth + 16,
                height: elementHeight + 6,
                left: elementRect.left - 8,
                top: elementRect.top - 6,
                paddingTop: 6,
                paddingLeft: 5,
            }
        }
    }, {
        selector: () => document.querySelector('#home-tab-listed'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'right',
        content: <Panel style={{ width: 260, marginLeft: 35, }}>
            <div className={styles.text}><span className={styles.importantText}>Listed</span> is where once the <span className={styles.importantText}>liquidity</span> threshold is met, FlipN migrate the Liquidity Pool to <span className={styles.importantText}>Meteora DLMM</span>, enabling full trading with optimized pricing and deep, sustainable liquidity.</div>
            <div className={styles.text}>Moreover, you can also <span className={styles.importantText}>trade memecoins</span> on <span className={styles.importantText}>other platform such as Pump.fun & GFM</span> here, in a whole different <span className={styles.importantText}>discovery experience</span>.</div>
            {step21}
        </Panel>,
        type: 'button',
        eleOuterOffset: (elementWidth: number, elementHeight: number, elementRect: ClientRect) => {
            return {
                width: elementWidth + 16,
                height: elementHeight + 6,
                left: elementRect.left - 8,
                top: elementRect.top - 6,
                paddingTop: 6,
                paddingLeft: 5,
            }
        }
    }, {
        selector: () => document.querySelector('#home-tab-genesis'),
        placement: MaskPlacement.Bottom,
        showAction: false,
        triggerEvent: 'click',
        content: <div style={{ color: '#fff', fontSize: 11, marginLeft: 0, marginTop: -30, transform: 'rotate(-15deg)' }}>Click here!</div>,
        type: 'button',
        eleOuterOffset: (elementWidth: number, elementHeight: number, elementRect: ClientRect) => {
            return {
                width: elementWidth + 16,
                height: elementHeight + 6,
                left: elementRect.left - 8,
                top: elementRect.top - 6,
                paddingTop: 6,
                paddingLeft: 5,
            }
        },
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        beforeForward: async () => {
            const ele: any = await waitForElement('#home-like-button');
            // if (ele) {
            //     ele.scrollIntoView({ behavior: 'smooth' });
            // }
        },
        
        content: <Panel style={{ width: 260, marginRight: 35 }}>
            <div className={styles.text}>Welcome to <span className={styles.importantText}>Genesis</span> feed!</div>
            <div className={styles.text}>Nyan will show you around what you can do here!</div>
            {step3}
        </Panel>,
    }, {
        selector: () => document.querySelector('#home-like-button'),
        placement: MaskPlacement.Top,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35, marginTop: -20 }}>
            <div className={styles.text}><span className={styles.importantText}>Click here</span> to <span className={styles.importantText}>Like</span> videos = memecoins that you like! Each like will earn you <span className={styles.importantText}>MEMETICS</span> as <span className={styles.importantText}>reward</span>!</div>
            <div className={styles.text}>The <span className={styles.importantText}>more quality</span> content & memecoins you <span className={styles.importantText}>like</span>, the more <span className={styles.importantText}>MEMETICS</span> you can receive as <span className={styles.importantText}>your reputation</span> score increase.</div>
            {arrowRightBottom}
        </Panel>,
        type: 'button',
        showOuter: false,
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'right',
        content: <div style={{ marginTop: 80 }}>
            <div className={styles.memeticsTitle}>MEMETICS</div>
            <Panel style={{ width: 295, marginRight: 0, }}>
                <div className={styles.text}>What are they? Are they a memecoin?</div>
                <div className={styles.text}><span className={styles.importantText}>Memetics</span> is a <span className={styles.importantText}>theory of the evolution of culture</span> based on <span className={styles.importantText}>Darwinian principles</span> with the <span className={styles.importantText}>meme as the unit of culture</span>.</div>
                <div className={styles.text}>FlipN <span className={styles.importantText}>adapted</span> this theory and truly believe that <span className={styles.importantText}>meme is the DNA of culture</span>.</div>
                <div className={styles.text}>Each time you <span className={styles.importantText}>Like</span> a video, you <span className={styles.importantText}>earn MEMETICS</span>. The more you <span className={styles.importantText}>contribute</span> to culture (<span className={styles.importantText}>quality content</span>), the more <span className={styles.importantText}>MEMETICS</span> you earn!</div>
            </Panel>
        </div>,
    }, {
        selector: () => document.querySelector('#home-flip-button'),
        placement: MaskPlacement.Top,
        showAction: true,
        actionLocation: 'left',
        locationStyle: { paddingLeft: 40 },
        content: <Panel style={{ width: 256, marginLeft: 40, marginTop: 20 }}>
            <div className={styles.text}>Although Genesis stage<span className={styles.importantText}> doesn’t allow trading</span>, but you can still <span className={styles.importantText}>bet</span> in a memecoin by <span className={styles.importantText}>Flip it!</span></div>
            <div className={styles.text}><span className={styles.importantText}>Flip</span> allows you the <span className={styles.importantText}>secure the earliest slot</span> to <span className={styles.importantText}>purchase</span> the memecoin as <span className={styles.importantText}>soon</span> as it moves to <span className={styles.importantText}>Ticking</span> phase!</div>
            {arrowLeftBottom}
        </Panel>,
        type: 'button',
        showOuter: false,
    }, {
        selector: () => document.querySelector('#home-tab-ticking'),
        placement: MaskPlacement.Bottom,
        showAction: false,
        triggerEvent: 'click',
        content: <div style={{ color: '#fff', fontSize: 11, marginLeft: 30, marginTop: -30, transform: 'rotate(-15deg)' }}>Click here!</div>,
        type: 'button',
        eleOuterOffset: (elementWidth: number, elementHeight: number, elementRect: ClientRect) => {
            return {
                width: elementWidth + 16,
                height: elementHeight + 6,
                left: elementRect.left - 8,
                top: elementRect.top - 6,
                paddingTop: 6,
                paddingLeft: 5,
            }
        },
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35 }}>
            <div className={styles.text}>Welcome to <span className={styles.importantText}>Bonding</span> feed!</div>
            <div className={styles.text}>Nyan will show you around what you can do here!</div>
            {step3}
        </Panel>,
    }, {
        selector: () => document.querySelector('#bonding-trade'),
        placement: MaskPlacement.Top,
        showAction: true,
        actionLocation: 'right',
        content: <Panel style={{ width: 256, marginLeft: 40, marginTop: 20 }}>
            <div className={styles.text}>This shows the <span className={styles.importantText}>progress</span> of a memecoins on its bonding curve and its current <span className={styles.importantText}>Marketcap</span>.</div>
            <div className={styles.text}>You can hit <span className={styles.importantText}>Trade</span> if you wish to <span className={styles.importantText}>purchase</span> the memecoin.</div>
            {arrowLeftBottom2}
        </Panel>,
        type: 'button',
        showOuter: false,
        locationStyle: { position: 'relative', top: -180 },
    }, {
        selector: () => document.querySelector('#home-action-details'),
        placement: MaskPlacement.Top,
        showAction: false,
        triggerEvent: 'click',
        content: <div style={{ position: 'relative', color: '#fff', fontSize: 11, marginLeft: '25vw', marginTop: 0, transform: 'rotate(-15deg)' }}>
            Click here!
            {arrowRightBottom2}
        </div>,
        beforeForward: async () => {
            const ele: any = await waitForElement('#token-summary');
            if (ele) {
                // ele.scrollIntoView({ behavior: 'smooth' });
            }
        },
        type: 'button',
    }, {
        selector: () => document.querySelector('#token-summary'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35 }}>
            <div className={styles.text}>This is the <span className={styles.importantText}>Details</span> page that consist <span className={styles.importantText}>every information</span> you need to know about the memecoins: Chart, holders, trades, volume etc...</div>
            {step3}
        </Panel>,
    }, {
        selector: () => document.querySelector('#detail-trade-button'),
        placement: MaskPlacement.Bottom,
        content: <div className={styles.scroll}>
            <div>Scroll down too see all info</div>
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
        selector: () => document.querySelector('#detail-back-button'),
        placement: MaskPlacement.BottomRight,
        showAction: false,
        triggerEvent: 'click',
        content: <div style={{ position: 'relative', color: '#fff', fontSize: 11, marginLeft: '30px', marginTop: '-20px', transform: 'rotate(-15deg)' }}>
            Click here!
        </div>,
        beforeForward: async () => {
            const ele: any = await waitForElement('#bonding-trade');
            if (ele) {
                // ele.scrollIntoView({ behavior: 'smooth' });
            }
        },
        type: 'button',
    }, {
        selector: () => document.querySelector('#home-tab-listed'),
        placement: MaskPlacement.Bottom,
        showAction: false,
        triggerEvent: 'click',
        content: <div style={{ color: '#fff', fontSize: 11, marginLeft: '44vw', marginTop: -30, transform: 'rotate(-15deg)' }}>Click here!</div>,
        type: 'button',
        eleOuterOffset: (elementWidth: number, elementHeight: number, elementRect: ClientRect) => {
            return {
                width: elementWidth + 16,
                height: elementHeight + 6,
                left: elementRect.left - 8,
                top: elementRect.top - 6,
                paddingTop: 6,
                paddingLeft: 5,
            }
        },
    }, {
        selector: () => document.querySelector('#tabs-wrapper'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35 }}>
            <div className={styles.text}>Welcome to <span className={styles.importantText}>Listed</span> feed!</div>
            <div className={styles.text}>This feed allows you to view, trade & engage with all the <span className={styles.importantText}>graduated memecoins</span> from FiNi!</div>
            <div className={styles.text}><span className={styles.importantText}>Hot tokens</span> from other launchpads such as <span className={styles.importantText}>Pump.fun</span> and <span className={styles.importantText}>GFM</span> can also be found here!</div>
            {step3}
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
        selector: () => document.querySelector('#bonding-trade'),
        placement: MaskPlacement.Top,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 256, marginRight: 40, marginTop: 20 }}>
            <div className={styles.text}>Let{"'"}s discover other sections on FlipN! </div>
            <div className={styles.text}>We{'’'}re almost done!</div>
            {step4}
        </Panel>,
    }, {
        selector: () => document.querySelector('#tab-bottom-Create'),
        placement: MaskPlacement.Top,
        showAction: false,
        content: <div>
            <div>
                <div className={styles.middleText}>Tap the screen to view next</div>
                <div style={{ width: 250, marginLeft: 80, transform: 'rotate(5deg)', marginTop: -50 }} className={styles.arrowText}>This is where you can post videos = launch memecoins on FlipN!</div>
            </div>
            <img src={icons[6]} alt="arrow" className={styles.arrowLeftBottom2} style={{ left: '45vw', top: '1vh' }} />
        </div>,
        eleOffset: { left: 30 },
        showOuter: false,
        type: 'button',
    }, {
        selector: () => document.querySelector('#tab-bottom-Memes'),
        placement: MaskPlacement.Top,
        showAction: false,
        content: <div>
            <div>
                <div className={styles.middleText}>Tap the screen to view next</div>
                <div style={{ width: 250, marginLeft: 40, transform: 'rotate(5deg)', marginTop: -30 }} className={styles.arrowText}>This is where you can see memecoins in a more trading-oriented view.</div>
            </div>
            <img src={icons[6]} alt="arrow" className={styles.arrowLeftBottom2} style={{ left: '28vw', top: '4vh' }} />
        </div>,
        eleOffset: { left: 30 },
        showOuter: false,
        type: 'button',
    }, {
        selector: () => document.querySelector('#tab-bottom-Smart'),
        placement: MaskPlacement.Top,
        showAction: false,
        eleOffset: { left: 30 },
        content: <div>
            <div>
                <div className={styles.middleText}>Tap the screen to view next</div>
                <div style={{ width: 250, marginLeft: '40vw', transform: 'rotate(5deg)', marginTop: -30 }} className={styles.arrowText}>This is coming very soon!</div>
            </div>
            <img src={icons[6]} alt="arrow" className={styles.arrowLeftBottom2} style={{ left: '66vw', top: '3vh' }} />
        </div>,
        showOuter: false,
        type: 'button',
    }, {
        selector: () => document.querySelector('#tab-bottom-Earn'),
        placement: MaskPlacement.Top,
        showAction: false,
        triggerEvent: 'click',
        eleOffset: { left: 30 },
        content: <div>
            <div>
                <div style={{ width: 250, marginLeft: '54vw', transform: 'rotate(-15deg)', marginTop: -10 }} className={styles.arrowText}>Click here</div>
            </div>
            <img src={icons[6]} alt="arrow" className={styles.arrowLeftBottom2} style={{ left: '88vw', top: '3vh' }} />
        </div>,
        type: 'button',
        showOuter: false,
        beforeForward: async () => {
            const ele: any = await waitForElement('#mining-top');
            if (ele) {
                // ele.scrollIntoView({ behavior: 'smooth' });
            }
        },
    }, {
        selector: () => document.querySelector('#mining-top'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginRight: 35 }}>
            <div className={styles.text}>This <span className={styles.importantText}>Earn</span> section will let you know <span className={styles.importantText}>every way</span> possible you can <span className={styles.importantText}>earn rewards</span> with <span className={styles.importantText}>FlipN</span>, such as your <span className={styles.importantText}>MEMETICS</span> balance, <span className={styles.importantText}>referrals kickback</span> etc..</div>
            {step4}
        </Panel>,
    }, {
        selector: () => document.querySelector('#mining-top'),
        placement: MaskPlacement.Bottom,
        showAction: true,
        actionLocation: 'left',
        content: <Panel style={{ width: 260, marginTop: 100, textAlign: 'center' }}>
            <div className={styles.text} style={{ fontWeight: 700 }}>
                Tutorial finished!
            </div>
            <div className={styles.text}>
                You should be able to <span className={styles.importantText}>navigate & use FlipN</span> with <span className={styles.importantText}>ease</span>!
            </div>
            <div className={styles.text}>
                Now go <span className={styles.importantText}>Like</span> some silly videos, <span className={styles.importantText}>stack up</span> some <span className={styles.importantText}>MEMETICS</span>, <span className={styles.importantText}>Flip</span> some memecoins and <span className={styles.importantText}>invite</span> your frens over to earn some fat <span className={styles.importantText}>revenue share</span> from FlipN!
            </div>
            <img src={icons[1]} alt="arrow" className={styles.arrowLeftBottom2} style={{ left: '52vw', top: '-12vh', width: 114 }} />
            <img src={icons[2]} alt="arrow" className={styles.arrowLeftBottom2} style={{ left: '-2vw', top: '-15vh', width: 114 }} />
            <img src={icons[3]} alt="arrow" className={styles.arrowLeftBottom2} style={{ left: '40vw', top: '35vh', width: 134 }} />
            <img src={icons[4]} alt="arrow" className={styles.arrowLeftBottom2} style={{ left: '-8vw', top: '28vh', width: 114 }} />
        </Panel>,
    }]} />
}



function waitForElement(selector: string, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            return resolve(element);
        }

        const observer = new MutationObserver((mutations) => {
            const el = document.querySelector(selector);
            if (el) {
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        if (timeout) {
            setTimeout(() => {
                observer.disconnect();
                reject(new Error('Timeout waiting for element: ' + selector));
            }, timeout);
        }
    });
}