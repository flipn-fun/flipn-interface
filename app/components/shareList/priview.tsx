import Modal from '../modal';
import Media from '../thumbnail/media';
import styles from './preview.module.css';
import { Project } from '@/app/type';
import { useUserAgent } from '@/app/context/user-agent';
import { httpGet } from '@/app/utils';
import { useEffect, useState } from 'react';

interface PreviewProps {
    isOpen: boolean;
    onClose: () => void;
    token: Project | undefined;
}

export default function Preview({ isOpen, onClose, token }: PreviewProps) {
    const { isMobile } = useUserAgent();
    const [shareCopy, setShareCopy] = useState('');

    useEffect(() => {
        const getShareCopy = async () => {
            if (token) {
                try {
                    const v = await httpGet("/project/sharing_copy");
                    if (v.code === 0) {
                        setShareCopy(v.data.SharingCopy || "");
                    }
                } catch (error) {
                    console.error("Failed to fetch share copy:", error);
                }
            }
        };

        getShareCopy();
    }, []);

    if (!token) {
        return null;
    }

    return (
        <Modal forceNoCloseIcon style={{ zIndex: 1000 }} open={isOpen} onClose={onClose}>
            <div className={styles.container + ' ' + (isMobile ? styles.mobile : styles.pc)}>
                <div className={styles.header}>
                    <span className={styles.backButton} onClick={onClose}>
                        <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.5 14L1.5 7.5L7.5 1" stroke="white" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </span>
                    <h2 className={styles.title}>Repost Video on X</h2>

                </div>

                <div className={styles.userAction}>
                    <div className={styles.userInfo}>
                        <img
                            src="/avatar.png"
                            alt="User avatar"
                            className={styles.avatar}
                        />
                        <span className={styles.username}>@Oxflipnfans</span>
                    </div>
                    <button className={styles.postButton}>Post</button>
                </div>

                <div className={styles.tokenMsg}>
                    <div className={styles.tokenName}>{shareCopy}</div>
                    <div className={styles.tokenMsgText}>👉 Buy now: <a href={`https://s.flipn.fun/qD`} target="_blank" rel="noreferrer">https://s.flipn.fun/qD</a></div>
                    <div className={styles.tokenMsgText}>🔗 CA: {token.address}</div>
                    <div className={styles.tokenMsgText}>🔥 Join us and be part of the $PEPEGIRL journey! <span className={styles.tokenMsgTextTag}>#PEPE #Solana #Crypto #FlipN</span></div>
                </div>

                <div className={styles.content}>
                    <div className={styles.videoContainer}>
                        <Media
                            imgHeight="100%"
                            data={token}
                            mediaId={token.id}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
