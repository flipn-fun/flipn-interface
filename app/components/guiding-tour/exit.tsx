import React from 'react';
import styles from './exit.module.css';

interface ExitProps {

    onConfirm: () => void;
    onCancel: () => void;
}

export const Exit: React.FC<ExitProps> = ({

    onConfirm,
    onCancel
}) => {
    return (
        <div className={styles.box}>
            <div className={styles.container}>
                <h2 className={styles.title}>Are you sure to skip the tutorial?</h2>
                <p className={styles.message}>It only takes 1 minute. This action can’t be undone</p>
                <div className={styles.buttonGroup}>
                    <button className={styles.confirmButton} onClick={onConfirm}>
                        Yes
                    </button>
                    <button className={styles.cancelButton} onClick={onCancel}>
                        Go back
                    </button>
                </div>
            </div>
        </div>
    );
};