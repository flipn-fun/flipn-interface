import { Button, SpinLoading } from 'antd-mobile';
import Modal from '../modal';
import styles from './auth.module.css';
import { useCallback, useState } from 'react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (code: string) => void;
    getAuthUrl: () => Promise<boolean>;
    bindTwitter: (verifier: string) => Promise<boolean>;
}

export default function AuthModal({ isOpen, onClose, onSuccess, getAuthUrl, bindTwitter }: AuthModalProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = useCallback(async () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        const result = await getAuthUrl();
        if (result) {
            setStep(2);
        }
        setIsLoading(false);
    }, [getAuthUrl, isLoading]);

    const handleConfirm = useCallback(async     () => {
        if (verificationCode) {
            if (isLoading) {
                return;
            }
            setIsLoading(true);
            const result = await bindTwitter(verificationCode);
            if (result) {
                setStep(1)
                onSuccess(verificationCode);
            }
            setIsLoading(false);
        }
    }, [bindTwitter, verificationCode, onSuccess]);


    return (
        <Modal forceNoCloseIcon style={{ zIndex: 1000, backdropFilter: 'blur(10px)', }}  open={isOpen} onClose={() => {
            setStep(1)
            onClose && onClose()
        }}>
            <div className={styles.container}>
                {step === 1 ? (
                    <>
                        <div className={styles.box}>
                            <h2 className={styles.title}>Authorize flipn.fun to access your X account.</h2>
                            <div className={styles.steps}>
                                <div className={styles.step}>
                                    <div className={styles.stepTitle}>Step1.</div>
                                    <div className={styles.stepContent}>
                                        Click on the <span className={styles.highlight}>Continue</span> button to
                                        open the <span className={styles.highlight}>Authorize</span> page in a new window for <svg style={{ position: 'relative', top: '3px' }} width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="19" height="19" rx="6" fill="black" />
                                            <path d="M10.6523 9.00945L14.5674 4.43311H13.2624L9.99977 8.0288L7.4653 4.43311H4.12704L8.0422 9.99009L3.80078 14.5664H5.34537L8.69472 10.9707L11.3048 14.5664H14.5674M5.75836 5.41375H7.06341L12.9361 13.5858H11.6311" fill="white" />
                                        </svg>
                                    </div>
                                </div>
                                <div className={styles.step}>
                                    <div className={styles.stepTitle}>Step2.</div>
                                    <div className={styles.stepContent}>
                                        After successful <span className={styles.highlight}>authorization</span>, get the verification code, <span className={styles.highlight}>go back</span> to the current page and <span className={styles.highlight}>fill</span> in the verification code you got.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button loading={isLoading} loadingIcon={<SpinLoading />} className={styles.continueButton} onClick={handleContinue}>
                            Continue
                        </Button>
                    </>
                ) : (
                    <div className={styles.authenticationContainer}>
                        <div className={styles.box}>
                            <h2 className={styles.title}>Authentication</h2>
                            <p className={styles.subtitle}>
                                We have sent you the verification code. Please enter it correctly.
                            </p>

                            <input
                                type="text"
                                className={styles.verificationInput}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                        </div>

                        <Button loading={isLoading} loadingIcon={<SpinLoading />} disabled={!verificationCode} className={styles.confirmButton} onClick={handleConfirm}>
                            confirm
                        </Button>
                        <button className={styles.resendButton} onClick={() => handleContinue()}>
                            resend
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
