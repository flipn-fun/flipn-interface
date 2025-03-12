import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.css';
import { trim } from 'lodash-es';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserAgent } from '@/app/context/user-agent';
import { useAirdropContext } from '@/app/context/airdrop';
import CouponCard from '@/app/sections/invite-code/components/coupon-card';
import { useBind } from '@/app/sections/invite-code/hooks/use-bind';

const InviteCodeForm: React.FC<any> = (props) => {
  const { className } = props;

  const router = useRouter();
  const { isMobile } = useUserAgent();
  const searchParams = useSearchParams();
  const { getAirdropData } = useAirdropContext();
  const {
    pending,
    codeValid,
    setCodeValid,
    handleBindDelay: handleCodeVerify,
    handleBindCancel: handleCodeVerifyCancel,
  } = useBind();

  const codeParam = searchParams.get('code');

  const inputRef = useRef<any>();
  const [code, setCode] = useState<string>();
  const [startLoading, setStartLoading] = useState<boolean>(false);

  const handleCodeChange=  (value?: string) => {
    setCodeValid(void 0);
    setCode(value);
  };

  const handleStart = () => {
    setStartLoading(true);
    const timer = setTimeout(async () => {
      clearTimeout(timer);
      await getAirdropData?.({ isLoading: false });
      const redirectTarget = searchParams.get("redirect");
      router.replace(redirectTarget || "/");
      setStartLoading(false);
    }, 300);
  };

  useEffect(() => {
    inputRef.current?.focus?.();
    if (codeParam) {
      setCode(trim(codeParam));
    }
  }, [codeParam]);

  return (
    <CouponCard
      className={className}
      disabled={pending || !codeValid || startLoading}
      loading={pending || startLoading}
      onClick={handleStart}
      buttonText="Start!"
    >
      <div className={styles.InviteCodeFormLabel}>
        Invite Code
      </div>
      <div className={styles.InviteCodeFormControlWrapper}>
        <input
          ref={inputRef}
          type="text"
          disabled={pending || codeValid}
          className={codeValid === false ? styles.InviteCodeFormControlInvalid : styles.InviteCodeFormControl}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          onBlur={(e) => handleCodeVerify(e.target.value)}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              // @ts-ignore
              handleCodeVerify(e.target.value);
            }
          }}
          onFocus={handleCodeVerifyCancel}
        />
      </div>
    </CouponCard>
  );
};

export default InviteCodeForm;
