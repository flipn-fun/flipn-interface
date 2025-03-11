import { trim } from 'lodash-es';
import { httpAuthPost, httpGet } from '@/app/utils';
import { fail, success } from '@/app/utils/toast';
import React, { useState } from 'react';
import { ToastMsg } from '@/app/sections/invite-code/components/toast-message';
import { useDebounceFn } from 'ahooks';

export function useBind(props?: any) {
  const [pending, setPending] = useState<boolean>();
  const [codeValid, setCodeValid] = useState<boolean>();
  const [codeValidMessage, setCodeValidMessage] = useState<string>();
  const [loadingInviterData, setLoadingInviterData] = useState<boolean>(true);
  const [inviterData, setInviterData] = useState<InviterData>();

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
        if (!["inviter account error", "account duplicate invitation error"].includes(msg.toLowerCase())) {
          fail(
            (
              <ToastMsg title="Invalid" msg={msg} />
            ),
            { isIcon: false, duration: 5000 }
          );
        }
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

  const getInviterByCode = async (code: string): Promise<boolean | InviterData> => {
    setLoadingInviterData(true);
    try {
      const res = await httpGet(`/kol/data?code=${code}`);
      if (res.code !== 0 || !res.data) {
        setLoadingInviterData(false);
        fail(res.message || "Failed to get inviter data");
        return false;
      }
      setInviterData(res.data);
      setLoadingInviterData(false);
      return res.data;
    } catch (err: any) {
      console.log('Get inviter by code failed: %o');
      fail(err.message || "Failed to get inviter data");
    }
    setLoadingInviterData(false);
    return false;
  };

  return {
    pending,
    setPending,
    codeValid,
    setCodeValid,
    handleBind,
    handleBindDelay,
    handleBindCancel,
    codeValidMessage,
    getInviterByCode,
    loadingInviterData,
    setLoadingInviterData,
    inviterData,
  };
}

export interface InviterData {
  account_icon: string;
  account_id: string;
  account_name: string;
  code: string;
}
