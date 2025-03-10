import { trim } from 'lodash-es';
import { httpAuthPost } from '@/app/utils';
import { fail, success } from '@/app/utils/toast';
import React, { useState } from 'react';
import { ToastMsg } from '@/app/sections/invite-code/components/toast-message';
import { useDebounceFn } from 'ahooks';

export function useBind(props?: any) {
  const [pending, setPending] = useState<boolean>();
  const [codeValid, setCodeValid] = useState<boolean>();
  const [codeValidMessage, setCodeValidMessage] = useState<string>();

  const handleBind = async (value?: string) => {
    if (pending || !trim(value) || codeValid) return;
    setPending(true);
    try {
      const urlParams = new URLSearchParams();
      urlParams.set('code', trim(value));
      const res = await httpAuthPost(`/airdrop/binding/code?${urlParams.toString()}`, {
        code: trim(value),
      });
      if (res.code !== 0) {
        setPending(false);
        const msg = res.message || 'Failed to verify code';
        fail(
          (
            <ToastMsg title="Invalid" msg={msg} />
          ),
          { isIcon: false, duration: 5000 }
        );
        setCodeValidMessage(msg);
        setCodeValid(false);
        return;
      }
      success((
        <ToastMsg title="Success" msg="Let’s get started!" isSuccess />
      ), { duration: 5000 });
      setCodeValidMessage(void 0);
      setCodeValid(true);
    } catch (err: any) {
      const msg = `Bind failed: ${err.message}` || 'Failed to verify code';
      fail(
        (
        <ToastMsg title="Invalid" msg={msg} />
        ),
        { isIcon: false, duration: 5000 }
      );
      setCodeValidMessage(msg);
      setCodeValid(false);
    }
    setPending(false);
  };

  const { run: handleBindDelay, cancel: handleBindCancel } = useDebounceFn(handleBind, { wait: 50 });

  return {
    pending,
    setPending,
    codeValid,
    setCodeValid,
    handleBind,
    handleBindDelay,
    handleBindCancel,
    codeValidMessage,
  };
}
